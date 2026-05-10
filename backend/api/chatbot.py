"""
Mix Agent v3 — Smart Auto-Switching API Router
================================================
• Gemini quota done  → auto-switch to HuggingFace
• HuggingFace quota done → auto-switch back to Gemini
• Both down → graceful fallback message (never crashes)
• SSE streaming word-by-word on port 10000

Run: uvicorn main:app --reload --port 10000
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import time
import uuid
from collections import deque
from typing import AsyncGenerator, Literal

import httpx
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from database.supabase_client import log_query
from api.search import PRODUCTS_DATA, SERVICES_DATA
from middleware.rate_limit import RateLimiter
from utils.helpers import sanitise_query
from utils.logger import get_logger

load_dotenv()
log     = get_logger("mix-agent-v3")
router  = APIRouter(prefix="/chatbot", tags=["chatbot"])
limiter = RateLimiter(max_calls=40, period_seconds=60)

# ── Keys & Models ─────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL   = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
HF_API_KEY     = os.getenv("HUGGINGFACE_API_KEY", "")
HF_MODEL       = os.getenv("HUGGINGFACE_MODEL", "mistralai/Mistral-7B-Instruct-v0.3")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")
GROQ_MODEL     = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
WHATSAPP_LINK  = os.getenv("WHATSAPP_LINK", "https://wa.me/919887754009")
WHATSAPP_DISPLAY = os.getenv("WHATSAPP_DISPLAY", "+91 98877 54009")

HF_URL = "https://router.huggingface.co/novita/v3/openai/chat/completions"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

# ═══════════════════════════════════════════════════════════════
# 1.  SMART API ROUTER
#     Automatically rotates between Gemini ↔ HuggingFace
# ═══════════════════════════════════════════════════════════════

Provider = Literal["gemini", "huggingface", "groq"]

QUOTA_KEYWORDS = [
    "quota", "rate limit", "exceeded", "429", "503",
    "resource_exhausted", "RESOURCE_EXHAUSTED",
    "not found", "404", "model not found", "rate_limit",
    "too many requests", "billing", "weekly limit",
]


def _is_quota_err(exc: Exception) -> bool:
    return any(k.lower() in str(exc).lower() for k in QUOTA_KEYWORDS)


class SmartAPIRouter:
    """
    Circular failover router.

    States: ok | cooling
    When a provider gets a quota/rate-limit error it enters
    COOLING for cooldown_secs. The other provider is used.
    After cooldown, the provider is retried automatically.
    """

    COOLDOWN = 120   # seconds before retrying a failed provider

    def __init__(self):
        self._state: dict[Provider, dict] = {
            "gemini":      {"status": "ok", "fail_at": 0.0, "fails": 0},
            "huggingface": {"status": "ok", "fail_at": 0.0, "fails": 0},
            "groq":        {"status": "ok", "fail_at": 0.0, "fails": 0},
        }
        self._last: Provider = "huggingface"  # so first choice is gemini

    # ── internal ─────────────────────────────────────────────
    def _cooling(self, p: Provider) -> bool:
        s = self._state[p]
        if s["status"] == "cooling":
            if time.monotonic() - s["fail_at"] >= self.COOLDOWN:
                s["status"] = "ok"
                log.info(f"[Router] {p} cooldown expired → ok")
                return False
            return True
        return False

    # ── public API ────────────────────────────────────────────
    def fail(self, p: Provider, reason: str = ""):
        s = self._state[p]
        s.update(status="cooling", fail_at=time.monotonic(), fails=s["fails"] + 1)
        log.warning(
            f"[Router] {p} → COOLING | reason={reason[:80]} "
            f"| fail#{s['fails']} | retry in {self.COOLDOWN}s"
        )

    def ok(self, p: Provider):
        s = self._state[p]
        if s["status"] != "ok":
            s.update(status="ok", fails=0)
            log.info(f"[Router] {p} → OK (recovered)")

    def pick(self) -> Provider | None:
        """Return the next available provider in fixed waterfall order."""
        for provider in ("gemini", "huggingface", "groq"):
            if not self._cooling(provider):
                return provider
        return None

    def force_ok(self, p: Provider):
        self._state[p].update(status="ok", fails=0)

    def status(self) -> dict:
        def _info(p: Provider) -> dict:
            s = self._state[p]
            rem = max(0.0, self.COOLDOWN - (time.monotonic() - s["fail_at"]))
            return {
                "status":    s["status"],
                "failures":  s["fails"],
                "cooldown_remaining_secs": round(rem) if s["status"] == "cooling" else 0,
            }
        return {"gemini": _info("gemini"), "huggingface": _info("huggingface")}


_router = SmartAPIRouter()


# ═══════════════════════════════════════════════════════════════
# 2.  SESSION MEMORY
# ═══════════════════════════════════════════════════════════════

class SessionStore:
    MAX = 12
    TTL = 3600

    def __init__(self):
        self._s: dict[str, dict] = {}

    def _prune(self):
        now = time.time()
        for k in [k for k, v in self._s.items() if now - v["t"] > self.TTL]:
            del self._s[k]

    def _get(self, sid: str) -> deque:
        self._prune()
        if sid not in self._s:
            self._s[sid] = {"d": deque(maxlen=self.MAX), "t": time.time()}
        self._s[sid]["t"] = time.time()
        return self._s[sid]["d"]

    def add(self, sid: str, role: str, content: str):
        self._get(sid).append({"role": role, "content": content})

    def history_text(self, sid: str) -> str:
        turns = list(self._get(sid))[-6:]
        return "\n".join(
            ("User" if t["role"] == "user" else "Mix") + ": " + t["content"]
            for t in turns
        )

    def gemini_history(self, sid: str) -> list[dict]:
        return [
            {
                "role": "user" if t["role"] == "user" else "model",
                "parts": [{"text": t["content"]}],
            }
            for t in self._get(sid)
        ]

    def hf_messages(self, sid: str, user_msg: str, system: str) -> list[dict]:
        msgs = [{"role": "system", "content": system}]
        for t in list(self._get(sid))[-6:]:
            msgs.append({"role": t["role"], "content": t["content"]})
        msgs.append({"role": "user", "content": user_msg})
        return msgs

    def clear(self, sid: str):
        if sid in self._s:
            self._s[sid]["d"].clear()


_sessions = SessionStore()


# ═══════════════════════════════════════════════════════════════
# 3.  SYSTEM PERSONA
# ═══════════════════════════════════════════════════════════════

SYSTEM = f"""
IMPORTANT: You must include a single space character between every word in your response. Do not concatenate words. Use a professional, readable format.

=== MIX — PRATHOMIX AI AGENT v3 ===

You are Mix, the official AI assistant for PRATHOMIX.
CRITICAL FORMATTING RULES:
1. ALWAYS add a space between EVERY word. NO exceptions.
2. Use proper grammar and clear paragraph breaks.
3. DO NOT send concatenated/compressed text like "wordwordword".
4. Use Markdown for readability: bullet points (• or *) for lists, **bold** for importance.
5. Each sentence must have spaces: "Hello world" NOT "Helloworld".
6. When creating lists, separate items with line breaks and spaces.

STRICT SCOPE:
You are strictly a business assistant for PRATHOMIX.
If a user asks general coding questions, jokes, or off-topic queries, politely decline and steer the conversation back to PRATHOMIX services.

PRODUCT KNOWLEDGE:
If a user asks about our products, you MUST list and briefly explain our specific products only:
• Travojo: A hyper-local safety and travel application.
• Nexura: A procedural coding practice platform.
• Restaurant AI SaaS: A platform with QR ordering, AI chatbots, and bill-splitting.
• AI Medical Assistant: A tool to summarize handwritten prescriptions.
Do not give generic PRATHOMIX definitions when specifically asked about products. Keep answers concise and strictly based on this list.

UNKNOWN-ANSWER POLICY:
Never guess, invent, or hallucinate information.
If you do not know the exact answer based on your instructions, reply EXACTLY with:
I am not sure about the specific details, but I'd love to connect you with our founder. You can chat directly on WhatsApp at +919887754009 or email us at  prathomix@gmail.com.

You are not allowed to make up product details, features, timelines, pricing, or claims that are not explicitly given in this prompt.

COMPANY:
• Founder: Pratham Kumar Singh — AI Architect & Full-Stack Engineer
• Mission: Engineer outcomes. Custom SaaS, AI automations, modern web apps.

PRODUCTS:
• Travojo — A hyper-local safety and travel application.
• Nexura — A procedural coding practice platform.
• Restaurant AI SaaS — A platform with QR ordering, AI chatbots, and bill-splitting.
• AI Medical Assistant — A tool to summarize handwritten prescriptions.
• Security Shield — Phishing detection, typosquatting protection

SERVICES:
Web Development (React + FastAPI) | AI Chatbot Development |
Workflow Automation | Secure Backend (Supabase + PostgreSQL) |
Cloud Deployment (Docker, Kubernetes)

RULES:
1. Professional, concise — under 180 words unless user asks for detail
2. Complex answers: Challenge → Solution → CTA
3. You represent PRATHOMIX and know every detail about the website, products, services, and pages.
4. Contact routing must be exact:
   - General inquiries: WhatsApp: {WHATSAPP_DISPLAY} | Email: prathomix@gmail.com
   - Founder-related queries: founder.prathomix@gmail.com
   - Support/Help: support.prathomix@gmail.com
5. If a user wants to build a project, create an app, or needs software, immediately encourage them to email prathomix@gmail.com for custom development.
6. NEVER invent pricing → /pricing or founder.prathomix@gmail.com
7. NEVER hallucinate features
8. If the user wants to navigate to a page, append exactly [ACTION_NAVIGATE: /path] at the very end of the response.
9. Off-topic → politely redirect to PRATHOMIX scope
10. Always end with a clear next step

CONTACT:
    Company: prathomix@gmail.com
    Founder: founder.prathomix@gmail.com
    Support: support.prathomix@gmail.com
    WhatsApp: {WHATSAPP_LINK}
"""

FALLBACK_MSG = (
    "I am having trouble reaching my AI engine right now.\n\n"
    f"📧  prathomix@gmail.com\n"
    f"💬  WhatsApp: {WHATSAPP_LINK}\n"
    f"👨‍💼  founder.prathomix@gmail.com\n\n"
    "We respond within 24 hours."
)


# ═══════════════════════════════════════════════════════════════
# 4.  RULE ENGINE  (zero-latency, zero API cost)
# ═══════════════════════════════════════════════════════════════

GREETINGS_RE = re.compile(r"^(hi|hello|hey|hii|yo|hola|greetings|good\s?(morning|afternoon|evening))[!., ]*$", re.I)
LEAD_GEN_RE = re.compile(
    r"\b(want to build|need (an? )?(app|software|website|platform|solution)|"
    r"build (an? )?(app|software|website|platform|solution)|"
    r"create (an? )?(app|software|website|platform|solution)|"
    r"develop (an? )?(app|software|website|platform|solution)|"
    r"custom (software|app|development|build)|mvp|prototype|automation)\b",
    re.I,
)

def _contact_route(message: str) -> tuple[str, str] | None:
    m = re.sub(r"\s+", " ", message.lower()).strip()

    if re.search(r"\b(founder|owner|pratham|who made|who built)\b", m):
        return (
            "contact_founder",
            "founder.prathomix@gmail.com",
        )

    if re.search(r"\b(support|help|issue|bug|problem|assistance)\b", m):
        return (
            "contact_support",
            "support.prathomix@gmail.com",
        )

    if re.search(r"\b(contact details|what is your email|your email|contact info|email|whatsapp|phone|contact|reach|connect|get in touch)\b", m):
        return (
            "contact_general",
            f"WhatsApp: {WHATSAPP_DISPLAY} | Email: prathomix@gmail.com",
        )

    return None


def _quick_local_reply(message: str) -> tuple[str, str] | None:
    m = re.sub(r"\s+", " ", message.lower()).strip()

    if GREETINGS_RE.fullmatch(m):
        return (
            "greeting",
            "Hello, I’m Mix, the PRATHOMIX AI assistant. I can help with services, products, founder info, contact details, and project scoping. What do you want to build?",
        )

    lead = _lead_generation_reply(message)
    if lead:
        return lead

    return _contact_route(message)


def _lead_generation_reply(message: str) -> tuple[str, str] | None:
    if LEAD_GEN_RE.search(message.lower()):
        return (
            "lead_generation",
            "If you're building a project, app, or custom software, email prathomix@gmail.com with a short brief and timeline, and we’ll scope custom development quickly.",
        )
    return None


_RULES: list[tuple[str, str, str]] = [
    (
        r"^(hi|hello|hey|hii|yo|hola|greetings|good\s?(morning|afternoon|evening))[!., ]*$",
        "greeting",
        "Hello, I’m Mix, the PRATHOMIX AI assistant. I can help with services, products, founder info, contact details, and project scoping. What do you want to build?",
    ),
    (
        r"\b(founder|owner|who made|who built|pratham|who is pratham)\b",
        "contact_founder",
        "founder.prathomix@gmail.com",
    ),
    (
        r"\b(support|help|issue|bug|problem|assistance)\b",
        "contact_support",
        "support.prathomix@gmail.com",
    ),
    (
        r"\b(contact details|what is your email|your email|contact info|email|whatsapp|phone|contact|reach|connect|get in touch)\b",
        "contact_general",
        f"WhatsApp: {WHATSAPP_DISPLAY} | Email: prathomix@gmail.com",
    ),
    (
        r"\b(want to build|need (an? )?(app|software|website|platform|solution)|build (an? )?(app|software|website|platform|solution)|create (an? )?(app|software|website|platform|solution)|develop (an? )?(app|software|website|platform|solution)|custom (software|app|development|build)|mvp|prototype|automation)\b",
        "lead_generation",
        "If you're building a project, app, or custom software, email prathomix@gmail.com with a short brief and timeline, and we’ll scope custom development quickly.",
    ),
    (
        r"\b(price|pricing|cost|plan|package|quote|how much|rate|budget)\b",
        "pricing_query",
        "Pricing is scoped to your needs. Send your requirements and budget to founder.prathomix@gmail.com or use /contact for a custom quote.",
    ),
    (
        r"\b(get started|start a project|want to build|how do i begin)\b",
        "getting_started",
        "Getting started is simple: share your goal on /contact, add your timeline and budget, and we’ll scope the build fast. You can also email founder.prathomix@gmail.com with a short brief.",
    ),
    (
        r"\b(founder|owner|who made|who built|pratham|who is pratham)\b",
        "founder_info",
        "PRATHOMIX was founded by Pratham Kumar Singh, a full-stack AI engineer focused on fast, secure, and practical software delivery. Founder email: founder.prathomix@gmail.com.",
    ),
]

PRODUCT_GUIDES: dict[str, str] = {
    "prathomix resto": (
        "PRATHOMIX Resto is our restaurant SaaS for QR ordering, split-bill checkout, bot automation, and smoother table turnover."
    ),
    "urban cuts": (
        "URBAN CUTS is our salon system for smart auto-scheduling, booking control, and admin workflow automation."
    ),
    "medical ai assistant": (
        "Medical AI Assistant translates prescriptions and reports into patient-friendly Hinglish and supports internal PoC workflows."
    ),
    "travojo": (
        "Travojo is our travel and safety ecosystem. It combines intelligent maps, live navigation, "
        "AI travel assistance, and hyper-local safety for smarter trips."
    ),
    "nexusbot": (
        "NexusBot is our multi-model chatbot engine built for fast responses and deeper reasoning."
    ),
    "physio ai": (
        "Physio AI is a smart healthcare app that tracks exercises with phone cameras and supports voice booking."
    ),
    "security shield": (
        "Security Shield is an AI-powered browser extension that detects typosquatting and blocks phishing sites."
    ),
    "documind ai": (
        "DocuMind AI lets users upload PDFs and ask questions in natural language."
    ),
}

PRODUCT_PATTERN = re.compile(
    r"\b(travojo|nexusbot|flowmind|insightai|vaultauth|sprintkit|physio\s*ai|security\s*shield|documind\s*ai|urban\s*cuts|medical\s*ai\s*assistant|prathomix\s*resto|custom\s*ai\s*agents?)\b",
    re.I,
)


def _rule_match(msg: str) -> tuple[str, str] | None:
    m = msg.lower().strip()
    product_match = PRODUCT_PATTERN.search(m)
    if product_match:
        matched = re.sub(r"\s+", " ", product_match.group(0).lower()).strip()
        guide = PRODUCT_GUIDES.get(matched)
        if guide:
            return f"product_{matched.replace(' ', '_')}", f"{guide} Ask me what part of it you want me to explain next."

    lead = _lead_generation_reply(msg)
    if lead:
        return lead

    for pattern, intent, resp in _RULES:
        if re.search(pattern, m):
            return intent, resp

    if re.search(r"\b(about|who are you|about us|company|prathomix|what is prathomix|what do you do|services|products|product)\b", m):
        return (
            "company_overview",
            "PRATHOMIX is a full-stack AI lab building chatbots, automations, SaaS products, analytics tools, API integrations, and security solutions. Tell me your use case and I’ll map it to the right service or product.",
        )
    return None


def _local_fallback_response(message: str) -> str:
    q = message.lower().strip()
    catalog = SERVICES_DATA + PRODUCTS_DATA

    for key, desc in PRODUCT_GUIDES.items():
        if key in q:
            return f"{desc} Tell me what you want to know next and I’ll narrow it down."

    def matched_items() -> list[dict]:
        words = [w for w in re.split(r"\W+", q) if len(w) > 3]
        hits: list[dict] = []
        for item in catalog:
            haystack = f"{item['title']} {item['desc']}".lower()
            if any(word == token for word in words for token in re.split(r"\W+", haystack)):
                hits.append(item)
        return hits

    if any(k in q for k in ("service", "services", "offer", "do you do", "what can you build")):
        return (
            "PRATHOMIX can help with AI chatbot development, process automation, full-stack SaaS, analytics, API integration, and security hardening. "
            "Share your goal on /contact and we’ll scope the right build for you."
        )

    if any(k in q for k in ("product", "products", "bot", "tool")):
        return (
            "PRATHOMIX products include NexusBot, FlowMind, InsightAI, VaultAuth, SprintKit, Travojo, Physio AI, Security Shield, DocuMind AI, URBAN CUTS, and Medical AI Assistant. "
            "Tell me which product you want and I’ll describe it in detail."
        )

    items = matched_items()
    if items:
        joined = "; ".join(f"{item['title']}: {item['desc']}" for item in items[:3])
        return f"I found these PRATHOMIX matches: {joined}. For the full site details, visit /services, /products, or /contact."

    return (
        "I can help with PRATHOMIX services, products, founder info, contact details, and project scoping. "
        "Ask me anything about the website or tell me what you want to build."
    )


# ═══════════════════════════════════════════════════════════════
# 5.  GEMINI PROVIDER
# ═══════════════════════════════════════════════════════════════

async def _deep_answer_gemini(message: str, session_id: str) -> str:
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model   = genai.GenerativeModel(GEMINI_MODEL, system_instruction=SYSTEM)
    history = _sessions.gemini_history(session_id)
    chat    = model.start_chat(history=history)
    resp    = await asyncio.to_thread(chat.send_message, message)
    return resp.text or ""


async def _gemini_stream(message: str, session_id: str) -> AsyncGenerator[str, None]:
    text = await _deep_answer_gemini(message, session_id)
    if not text:
        yield "Error getting response."
        return

    chunk_size = 4
    for i in range(0, len(text), chunk_size):
        yield text[i : i + chunk_size]
        await asyncio.sleep(0.01)


# ═══════════════════════════════════════════════════════════════
# 6.  HUGGINGFACE PROVIDER
# ═══════════════════════════════════════════════════════════════

async def _deep_answer_huggingface(message: str, session_id: str) -> str:
    headers = {"Authorization": f"Bearer {HF_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model":       HF_MODEL,
        "messages":    _sessions.hf_messages(session_id, message, SYSTEM),
        "temperature": 0.45,
        "max_tokens":  500,
        "stream":      False,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.post(HF_URL, headers=headers, json=payload)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"] or ""


async def _hf_stream(message: str, session_id: str) -> AsyncGenerator[str, None]:
    headers = {"Authorization": f"Bearer {HF_API_KEY}", "Content-Type": "application/json"}
    payload = {
        "model":       HF_MODEL,
        "messages":    _sessions.hf_messages(session_id, message, SYSTEM),
        "temperature": 0.45,
        "max_tokens":  500,
        "stream":      True,
    }
    async with httpx.AsyncClient(timeout=30) as client:
        async with client.stream("POST", HF_URL, headers=headers, json=payload) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                line = line.strip()
                if not line or line == "data: [DONE]":
                    continue
                if line.startswith("data: "):
                    try:
                        delta = (
                            json.loads(line[6:])["choices"][0]
                            .get("delta", {})
                            .get("content", "")
                        )
                        if delta:
                            yield delta
                            await asyncio.sleep(0)
                    except (json.JSONDecodeError, KeyError, IndexError):
                        continue


def _groq_client():
    from openai import OpenAI
    return OpenAI(api_key=GROQ_API_KEY, base_url="https://api.groq.com/openai/v1")


async def _deep_answer_groq(message: str, session_id: str) -> str:
    client = _groq_client()
    messages = _sessions.hf_messages(session_id, message, SYSTEM)

    def _call():
        return client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.45,
            max_tokens=500,
        )

    resp = await asyncio.to_thread(_call)
    content = resp.choices[0].message.content or ""
    return content


async def _resolve_ai_answer(message: str, session_id: str) -> tuple[str, str, list[str]]:
    attempts: list[str] = []

    try:
        attempts.append("gemini")
        text = await _deep_answer_gemini(message, session_id)
        if not text:
            raise RuntimeError("Empty response")
        _router.ok("gemini")
        return text, "gemini", attempts
    except Exception as gemini_exc:
        _router.fail("gemini", str(gemini_exc))
        log.warning(f"[Waterfall] gemini failed, falling back to huggingface: {gemini_exc}")

        try:
            attempts.append("huggingface")
            text = await _deep_answer_huggingface(message, session_id)
            if not text:
                raise RuntimeError("Empty response")
            _router.ok("huggingface")
            return text, "huggingface", attempts
        except Exception as hf_exc:
            _router.fail("huggingface", str(hf_exc))
            log.warning(f"[Waterfall] huggingface failed, falling back to groq: {hf_exc}")

            try:
                attempts.append("groq")
                text = await _deep_answer_groq(message, session_id)
                if not text:
                    raise RuntimeError("Empty response")
                _router.ok("groq")
                return text, "groq", attempts
            except Exception as groq_exc:
                _router.fail("groq", str(groq_exc))
                log.warning(f"[Waterfall] groq failed, using local fallback: {groq_exc}")
                return _local_fallback_response(message), "fallback", attempts


async def _build_reply(message: str, session_id: str) -> tuple[str, str, str, list[str]]:
    quick = _quick_local_reply(message)
    if quick:
        intent, text = quick
        return intent, text, "local", ["local"]

    rule = _rule_match(message)
    if rule:
        intent, text = rule
        return intent, text, "rule", ["rule"]

    text, source, attempts = await _resolve_ai_answer(message, session_id)
    return "general_faq", text, source, attempts


# ═══════════════════════════════════════════════════════════════
# 7.  UNIFIED SMART STREAM — where the auto-switching happens
# ═══════════════════════════════════════════════════════════════

async def _smart_stream(
    message: str, session_id: str
) -> AsyncGenerator[tuple[str, Provider | None], None]:
    """
    Yields (text_chunk, provider_used).
    Auto-switches on quota errors.
    """
    tried: set[Provider] = set()

    while True:
        provider = _router.pick()

        if provider is None or provider in tried:
            log.error("[Smart Stream] Both providers unavailable → local fallback")
            fallback = _local_fallback_response(message)
            for w in fallback.split(" "):
                yield f"{w} ", None
                await asyncio.sleep(0.01)
            return

        tried.add(provider)
        _router._last = provider
        log.info(f"[Smart Stream] provider={provider}")

        try:
            yield f"\x00PROVIDER:{provider}", provider

            if provider == "gemini":
                async for chunk in _gemini_stream(message, session_id):
                    yield chunk, provider
            else:
                async for chunk in _hf_stream(message, session_id):
                    yield chunk, provider

            _router.ok(provider)
            return

        except Exception as exc:
            log.warning(f"[Smart Stream] {provider} error: {exc}")

            if _is_quota_err(exc):
                _router.fail(provider, str(exc))
                other: Provider = "huggingface" if provider == "gemini" else "gemini"
                log.info(f"[Smart Stream] quota hit → switching to {other}")
                yield f"\x00SWITCH:{other}", None
            else:
                log.warning(f"[Smart Stream] {provider} failed non-quota → local fallback")
                fallback = _local_fallback_response(message)
                for w in fallback.split(" "):
                    yield f"{w} ", provider
                    await asyncio.sleep(0.01)
                return


# ═══════════════════════════════════════════════════════════════
# 8.  SSE PIPELINE
# ═══════════════════════════════════════════════════════════════

def _sse(text: str = "", event: str = "token") -> str:
    return f"event: {event}\ndata: {json.dumps({'text': text})}\n\n"


async def _sse_pipeline(
    message: str, session_id: str, user_id: str | None
) -> AsyncGenerator[str, None]:

    full    = ""
    intent  = "general_faq"
    source  = "fallback"

    try:
        intent, text, source, attempts = await _build_reply(message, session_id)

        if source in ("local", "rule"):
            yield _sse("", "rule_response")
        else:
            if attempts:
                yield _sse(attempts[0], "provider_start")
                for attempt in attempts[1:]:
                    yield _sse(attempt, "provider_switch")
                yield _sse(source, "provider_active")

        if not text:
            yield _sse("Error getting response.")
            return

        chunk_size = 4
        for i in range(0, len(text), chunk_size):
            chunk = text[i : i + chunk_size]
            full += chunk
            yield _sse(chunk)
            await asyncio.sleep(0.01)

    except Exception as exc:
        log.error(f"[SSE Pipeline] {exc}")
        yield _sse(FALLBACK_MSG)
        full = FALLBACK_MSG

    # ── Save to memory ────────────────────────────────────────
    _sessions.add(session_id, "user",      message)
    _sessions.add(session_id, "assistant", full)

    # ── Log to Supabase ───────────────────────────────────────
    try:
        await log_query(
            query=message, intent=intent,
            response=full, user_id=user_id,
        )
    except Exception as e:
        log.warning(f"[SSE Pipeline] Supabase log failed: {e}")

    yield (
        "event: done\n"
        f"data: {json.dumps({'intent': intent, 'source': source, 'router': _router.status()})}\n\n"
    )


# ═══════════════════════════════════════════════════════════════
# 9.  SCHEMAS
# ═══════════════════════════════════════════════════════════════

class ChatRequest(BaseModel):
    message:    str
    session_id: str | None = None
    user_id:    str | None = None


class SyncResponse(BaseModel):
    response:   str
    intent:     str
    session_id: str
    source:     str
    router:     dict


# ═══════════════════════════════════════════════════════════════
# 10.  ENDPOINTS
# ═══════════════════════════════════════════════════════════════

@router.post("/stream", summary="Stream Mix response (SSE) — auto-switching AI")
async def stream(req: ChatRequest, request: Request, _=Depends(limiter)):
    """
    SSE endpoint. Event types:
      provider_start   — which AI was initially picked
      provider_active  — which AI is currently generating
      provider_switch  — quota hit, switched to this provider
      rule_response    — answered by rule engine (no AI used)
      token            — text chunk to append
      done             — stream finished (includes router status)
    """
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty.")

    msg = sanitise_query(req.message)
    sid = req.session_id or str(uuid.uuid4())

    return StreamingResponse(
        _sse_pipeline(msg, sid, req.user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control":              "no-cache",
            "X-Accel-Buffering":          "no",
            "Access-Control-Allow-Origin": "*",
            "X-Session-Id":               sid,
        },
    )


@router.post("/chat", response_model=SyncResponse, summary="Sync fallback")
async def chat_sync(req: ChatRequest, request: Request, _=Depends(limiter)):
    if not req.message.strip():
        raise HTTPException(400, "Message cannot be empty.")

    msg = sanitise_query(req.message)
    sid = req.session_id or str(uuid.uuid4())

    full   = ""
    intent = "general_faq"
    source = "fallback"

    intent, full, source, _ = await _build_reply(msg, sid)

    return SyncResponse(
        response=full or FALLBACK_MSG,
        intent=intent,
        session_id=sid,
        source=source,
        router=_router.status(),
    )


@router.get("/router/status", summary="Live router health check")
async def router_status():
    """See which AI is active and which is cooling."""
    active = _router.pick()
    return {
        "active_provider": active or "none — both cooling",
        "providers":       _router.status(),
        "models": {
            "gemini":      GEMINI_MODEL,
            "huggingface": HF_MODEL,
            "groq":        GROQ_MODEL,
        },
    }


@router.post("/router/reset/{provider}", summary="Force-reset a provider")
async def reset_provider(provider: str):
    """Admin: manually bring a provider back to 'ok'."""
    targets = ["gemini", "huggingface", "groq"] if provider == "both" else [provider]
    for p in targets:
        if p not in ("gemini", "huggingface", "groq"):
            raise HTTPException(400, f"Unknown provider: {p}")
        _router.force_ok(p)
        log.info(f"[Router] {p} manually reset to ok")
    return {"reset": targets, "status": _router.status()}


@router.get("/suggestions")
async def suggestions():
    return {
        "suggestions": [
            "What can Mix help me with?",
            "Tell me about Travojo.",
            "What AI services does PRATHOMIX offer?",
            "Can you build a custom chatbot?",
            "What is the Medical AI Assistant?",
            "How quickly can you deliver an MVP?",
            "How do I get started?",
            "Who is the founder of PRATHOMIX?",
            "What is Nexura?",
            "What does Security Shield do?",
        ]
    }


@router.delete("/session/{session_id}")
async def clear_session(session_id: str):
    _sessions.clear(session_id)
    return {"cleared": True, "session_id": session_id}