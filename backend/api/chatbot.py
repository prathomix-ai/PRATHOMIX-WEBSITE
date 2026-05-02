"""
SmartBot AI endpoint — HuggingFace (fast intent parsing) + Gemini (deep reasoning).

Flow:
  1. Build conversation context from history (multi-turn memory)
  2. Parse intent with HuggingFace LLaMA-3 (< 200ms)
  3. If complex_problem → escalate to Gemini
  4. Check Redis cache before expensive AI calls
  5. Fallback to WhatsApp/email if AI cannot resolve
  6. Log all interactions to Supabase chatbot_logs
"""
import os
import json
import hashlib
import re
import httpx
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from middleware.rate_limit import RateLimiter
from database.supabase_client import log_query
from utils.logger import get_logger
from utils.helpers import sanitise_query

load_dotenv()

router  = APIRouter(prefix="/chatbot", tags=["chatbot"])
log     = get_logger("chatbot")
limiter = RateLimiter(max_calls=30, period_seconds=60)
HF_API_KEY = os.getenv("HUGGINGFACE_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash-latest")

# ── Lazy client factories ────────────────────────────────────

def _gemini():
    import google.generativeai as genai
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set")
    genai.configure(api_key=GEMINI_API_KEY)
    return genai.GenerativeModel(GEMINI_MODEL)

# ── PRATHOMIX context ─────────────────────────────────────────

SYSTEM_CONTEXT = """
=== MIX — PRATHOMIX OFFICIAL AI ASSISTANT ===

You are Mix, the official AI assistant for PRATHOMIX — a rapid-execution AI laboratory and software studio.

COMPANY IDENTITY:
• Name: PRATHOMIX
• Mission: We don't just write code; we deliver results. We build custom SaaS, AI automations, and modern web apps to save businesses time and money.
• Founder: Pratham Kumar Singh, an AI Architect and Full-Stack Engineer specializing in rapid prototyping and scalable systems.

CORE CAPABILITIES & SERVICES:
1. Web Development — Modern, scalable web applications (React, Vue, etc.)
2. Smart AI Chatbots — Custom conversational AI using Groq + Gemini for intent parsing and reasoning
3. Workflow Automation — AI-powered process automation to eliminate manual bottlenecks
4. Secure Backend Setup — FastAPI, Supabase, PostgreSQL, with enterprise-grade security
5. Cloud Deployment — Docker containerization, Kubernetes orchestration, and multi-cloud strategies

LIVE & BETA PRODUCTS:
1. Medical AI Assistant — Analyzes prescriptions and medical reports, explains findings in English, Hindi, and Hinglish
2. Travojo — A hyper-local safety and travel ecosystem with real-time alerts and personalized recommendations
3. Nexura — An animated, interactive AI coding practice lab for developers and learners
4. PRATHOMIX Resto — Next-generation restaurant AI SaaS with smart ordering, inventory, and customer analytics
5. Security Shield — Real-time phishing detection, typosquatting protection, and zero-trust security

TONE & COMMUNICATION STYLE:
- Professional, highly intelligent, concise, and genuinely helpful
- Warm and approachable; speak as a trusted advisor
- Always provide context and explain *why*, not just *what*
- For business questions, think in terms of business outcomes and ROI
- Be confident but never arrogant; admit limitations gracefully

CONVERSATION GUIDELINES:
1. ALWAYS map user problems to PRATHOMIX's services, products, or expertise
2. For complex business problems: Structure your answer as (Challenge → Solution → Timeline/CTA)
3. NEVER HALLUCINATE — if asked about topics outside PRATHOMIX's scope, politely redirect
4. NEVER MAKE UP PRICING — always direct to /pricing page or suggest contacting the founder
5. When uncertain, default to: "I specialize in PRATHOMIX's services and AI technology. For anything else, please contact our team."

CONTACT INFORMATION:
• General Inquiries: prathomix@gmail.com
• Founder / Business Discussions: founder.prathomix@gmail.com
• WhatsApp: {whatsapp}
• Response Time: Within 24 hours

KNOWLEDGE BOUNDARIES:
✓ DO discuss: PRATHOMIX services, products, company mission, technology stack, deployment strategies, AI/ML approaches
✗ DON'T discuss: Unrelated topics (politics, sports, celebrity gossip, general trivia)
✗ DON'T claim: That you can build anything (be honest about constraints and timelines)
✗ DON'T speculate: On pricing, timelines, or capabilities outside PRATHOMIX's proven track record

Your role is to be a trusted first touchpoint for business inquiries and product questions.
"""

SYSTEM_INSTRUCTION = (
    "You are Mix, the official PRATHOMIX AI Assistant. Follow the system context strictly, stay on-brand, be concise, and never hallucinate. If the question is outside PRATHOMIX's scope, politely redirect the user to the team."
)

FALLBACK = (
    "I want to make sure you get the right answer.\n\n"
    "I specialize in PRATHOMIX's services and AI technology. For anything outside this scope, "
    "please reach out to our team directly:\n\n"
    "📧 Email: prathomix@gmail.com\n"
    "💬 WhatsApp: {whatsapp}\n"
    "👨‍💼 Founder: founder.prathomix@gmail.com\n\n"
    "We reply within 24 hours."
)

SIMPLE_INTENTS = {
    "greeting",
    "pricing_query",
    "product_info",
    "service_info",
    "contact_request",
    "about_info",
    "founder_info",
    "getting_started",
}

RULE_RESPONSES = {
    "greeting": (
        "Hello! Welcome to PRATHOMIX. I am your AI assistant. How can I help you scale your business "
        "or answer questions about our tools today?\n\n"
        "I can help with:\n"
        "• Our AI services \n"
        "• Product information \n"
        "• Pricing and packages\n"
        "• Getting started with a project\n\n"
        "What interests you most?"
    ),
    "pricing": (
        "Pricing depends on your scope, complexity, and timeline. We offer flexible engagement models:\n\n"
        "• Hourly Consulting: For quick audits and strategy sessions\n"
        "• Fixed-Scope Projects: For well-defined builds (chatbots, SaaS MVPs, automation)\n"
        "• Retainer Partnerships: For ongoing development and optimization\n\n"
        "Visit /pricing for our current plans, or let me know your goal and team size for a custom quote.\n"
        "Contact founder.prathomix@gmail.com for enterprise discussions."
    ),
    "services": (
        "🚀 PRATHOMIX Core Services:\n\n"
        "1️⃣ Web Development — Modern, scalable React/Vue apps with FastAPI backends\n"
        "2️⃣ Smart AI Chatbots — Custom conversational AI (Groq + Gemini), 24/7 automation\n"
        "3️⃣ Workflow Automation — AI-powered process optimization, eliminate manual work\n"
        "4️⃣ Secure Backend Setup — FastAPI, Supabase, PostgreSQL with enterprise security\n"
        "5️⃣ Cloud Deployment — Docker, Kubernetes, multi-cloud strategies\n\n"
        "Tell me what you want to build (chatbot, automation, SaaS app, integration, security audit), "
        "and I'll recommend the best fit."
    ),
    "products": (
        "🛠️ PRATHOMIX Live & Beta Products:\n\n"
        "🏥 Medical AI Assistant — Analyzes prescriptions/medical reports, explains in English/Hindi/Hinglish\n"
        "✈️ Travojo — Hyper-local travel safety ecosystem with real-time alerts\n"
        "💻 Nexura — Interactive AI coding practice lab for developers and learners\n"
        "🍽️ PRATHOMIX Resto — Next-gen restaurant AI SaaS (ordering, inventory, analytics)\n"
        "🛡️ Security Shield — Real-time phishing detection and typosquatting protection\n\n"
        "Which product interests you? I can explain any in detail."
    ),
    "contact": (
        "📧 General Questions: prathomix@gmail.com\n"
        "👨‍💼 Business/Founder: founder.prathomix@gmail.com\n"
        "💬 WhatsApp: {whatsapp}\n\n"
        "Also, visit our Contact page at /contact to fill out a project inquiry form.\n"
        "We respond within 24 hours."
    ),
    "about": (
        "👋 About PRATHOMIX:\n\n"
        "We are a rapid-execution AI laboratory and software studio founded by Pratham Kumar Singh, "
        "an AI Architect and Full-Stack Engineer.\n\n"
        "Our Promise: We don't just write code; we deliver results. We build custom SaaS, AI automations, "
        "and modern web apps to save businesses time and money.\n\n"
        "Core Strengths:\n"
        "✓ Rapid prototyping & MVP delivery\n"
        "✓ AI-powered automation & chatbots\n"
        "✓ Full-stack development (React + FastAPI + Supabase)\n"
        "✓ Enterprise-grade security & deployment\n\n"
        "Want to learn more? Visit our /about page or contact founder.prathomix@gmail.com"
    ),
    "founder_info": (
        "👨‍💻 About Pratham Kumar Singh (Founder):\n\n"
        "Pratham is an AI Architect and Full-Stack Engineer with expertise in:\n"
        "• Rapid prototyping and scalable system design\n"
        "• AI/ML model integration (Groq, Gemini, HuggingFace)\n"
        "• Modern full-stack development (React, FastAPI, Supabase, Docker)\n"
        "• Building production-grade AI applications\n\n"
        "He founded PRATHOMIX to solve real business problems with AI and custom software.\n\n"
        "Want to chat with Pratham directly? Email: founder.prathomix@gmail.com"
    ),
    "getting_started": (
        "To get started with PRATHOMIX:\n\n"
        "1. Visit the Contact page and share your goal\n"
        "2. Tell us what you want to build, your timeline, and your budget\n"
        "3. We will recommend the best service, stack, and delivery plan\n\n"
        "You can also email founder.prathomix@gmail.com with a short project brief."
    ),
    "default": (
        "I'm Mix, your PRATHOMIX AI assistant. I can help with:\n\n"
        "💼 Services — Web dev, chatbots, automation, backends, cloud deployment\n"
        "🛠️ Products — Medical AI, Travojo, Nexura, Resto, Security Shield\n"
        "💰 Pricing — Custom quotes based on your needs\n"
        "🤝 Getting Started — How to work with PRATHOMIX\n\n"
        "What would you like to know?"
    ),
}


def _rule_based_answer(message: str) -> tuple[str, str]:
    msg = message.lower().strip()
    
    # Greetings
    if re.fullmatch(r"(hi|hello|hey|hii|yo|hola|greetings|welcome)[!. ]*", msg):
        return "greeting", RULE_RESPONSES["greeting"]
    
    # Pricing/Cost questions
    if re.search(r"\b(price|pricing|cost|plan|package|quote|rate|expense|budget|how much)\b", msg):
        return "pricing_query", RULE_RESPONSES["pricing"]
    
    # Services/Development
    if re.search(r"\b(service|services|offer|provide|build|development|automation|chatbot|backend|deploy|web app|saas|saaS)\b", msg):
        return "service_info", RULE_RESPONSES["services"]
    
    # Products
    if re.search(r"\b(product|products|nexusbot|flowmind|insightai|vaultauth|sprintkit|medical ai|travojo|nexura|resto|security shield)\b", msg):
        return "product_info", RULE_RESPONSES["products"]
    
    # Contact/Reach out
    if re.search(r"\b(contact|email|whatsapp|call|phone|reach|connect|talk to|get in touch|speak to)\b", msg):
        return "contact_request", RULE_RESPONSES["contact"].format(whatsapp=_whatsapp())
    
    # Founder/Pratham questions
    if re.search(r"\b(founder|pratham|who is|created|created by|founder prathomix|pratham singh)\b", msg):
        return "founder_info", RULE_RESPONSES["founder_info"]

    if re.search(r"\b(get started|getting started|start project|project brief|build my|need a project|want to build|how do i begin|what should i do first)\b", msg):
        return "getting_started", RULE_RESPONSES["getting_started"]
    
    # About company
    if re.search(r"\b(about|company|who are|team|mission|what do you|what does prathomix)\b", msg):
        return "about_info", RULE_RESPONSES["about"]
    
    # Default to AI (general_faq)
    return "general_faq", RULE_RESPONSES["default"]

# ── Schemas ───────────────────────────────────────────────────

class Message(BaseModel):
    role: str    # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    user_id: str | None                = None
    history: list[Message]             = []   # last N turns from the client
    session_id: str | None             = None

class ChatResponse(BaseModel):
    response: str
    intent: str
    source: str   # "groq" | "gemini" | "cache" | "fallback"
    session_id: str | None = None

# ── Cache helpers ─────────────────────────────────────────────

def _cache_key(message: str) -> str:
    h = hashlib.md5(message.lower().strip().encode()).hexdigest()[:12]
    return f"smartbot:response:{h}"

# ── AI helpers ────────────────────────────────────────────────

def _whatsapp() -> str:
    return os.getenv("WHATSAPP_LINK", "https://wa.me/919887754009")

def _build_history_text(history: list[Message]) -> str:
    """Convert history to a readable conversation snippet (last 6 turns max)."""
    turns = history[-6:]
    lines = []
    for m in turns:
        prefix = "User" if m.role == "user" else "SmartBot"
        lines.append(f"{prefix}: {m.content}")
    return "\n".join(lines)

async def _hf_chat_completion(messages: list[dict], temperature: float = 0.3, max_tokens: int = 600) -> str:
    if not HF_API_KEY:
        raise RuntimeError("HUGGINGFACE_API_KEY is not set")

    url = "https://api-inference.huggingface.co/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {HF_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "meta-llama/Meta-Llama-3-8B-Instruct",
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()

    if isinstance(data, dict) and data.get("error"):
        raise RuntimeError(data["error"])

    return data["choices"][0]["message"]["content"].strip()


async def _deep_answer_gemini(message: str, history_text: str) -> str:
    model   = _gemini()
    context = SYSTEM_CONTEXT.format(whatsapp=_whatsapp())

    conv_block = f"\n\nConversation history:\n{history_text}\n" if history_text else ""

    prompt = (
        f"{context}{conv_block}\n\n"
        f"User's latest message:\n\"{message}\"\n\n"
        "IMPORTANT GUARDRAILS:\n"
        "1. If the user asks about topics OUTSIDE PRATHOMIX's scope (politics, sports, trivia, etc.), "
        "politely redirect them by saying: 'I specialize in PRATHOMIX's services and AI technology. "
        "For anything else, please contact our team.'\n"
        "2. NEVER make up product features, pricing, or capabilities that are not mentioned in your context\n"
        "3. If uncertain about timelines, pricing, or specific details, direct them to contact the team\n"
        "4. If the user wants to start a project or talk to the founder, send them to the Contact page or founder.prathomix@gmail.com\n"
        "5. Keep the response concise, professional, and useful\n\n"
        "Respond in this structure:\n"
        "- One direct answer\n"
        "- One or two relevant PRATHOMIX services/products\n"
        "- One clear next step or CTA\n\n"
        "Keep it under 180 words."
    )

    response = model.generate_content(prompt)
    return response.text.strip()

async def _deep_answer_hf(message: str, history_text: str) -> str:
    context = SYSTEM_CONTEXT.format(whatsapp=_whatsapp())
    conv_block = f"\n\nConversation history:\n{history_text}\n" if history_text else ""
    prompt = (
        f"{context}{conv_block}\n\n"
        f"User's latest message:\n\"{message}\"\n\n"
        "IMPORTANT GUARDRAILS:\n"
        "1. If the user asks about topics OUTSIDE PRATHOMIX's scope (politics, sports, trivia, etc.), "
        "politely redirect them by saying: 'I specialize in PRATHOMIX's services and AI technology. "
        "For anything else, please contact our team.'\n"
        "2. NEVER make up product features, pricing, or capabilities that are not mentioned in your context\n"
        "3. If uncertain about timelines, pricing, or specific details, direct them to contact the team\n"
        "4. If the user wants to start a project or talk to the founder, send them to the Contact page or founder.prathomix@gmail.com\n"
        "5. Keep the response concise, professional, and useful\n\n"
        "Respond in this structure:\n"
        "- One direct answer\n"
        "- One or two relevant PRATHOMIX services/products\n"
        "- One clear next step or CTA\n\n"
        "Keep it under 180 words."
    )

    return await _hf_chat_completion(
        messages=[
            {"role": "system", "content": SYSTEM_INSTRUCTION},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=500,
    )

# ── Endpoint ──────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest, req: Request, _=Depends(limiter)):
    raw_message = request.message.strip()
    if not raw_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    message     = sanitise_query(raw_message)
    history_text = _build_history_text(request.history)
    intent      = "general_faq"
    answer      = ""
    source      = "rule"

    # ── Cache check ───────────────────────────────────────────
    if not history_text:  # Only cache stateless queries
        try:
            from cache.redis_client import cache_get, cache_set
            cached = await cache_get(_cache_key(message))
            if cached and isinstance(cached, dict):
                log.info(f"Cache hit for: {message[:40]}")
                return ChatResponse(
                    response=cached.get("response", ""),
                    intent=cached.get("intent", "cache"),
                    source="cache",
                    session_id=request.session_id,
                )
        except Exception:
            pass  # Cache miss or Redis down — continue normally

    # ── AI processing ─────────────────────────────────────────
    intent, answer = _rule_based_answer(message)
    if intent in SIMPLE_INTENTS:
        source = "rule"
    elif intent == "general_faq":
        try:
            if GEMINI_API_KEY:
                source = "gemini"
                answer = await _deep_answer_gemini(message, history_text)
            elif HF_API_KEY:
                source = "huggingface"
                answer = await _deep_answer_hf(message, history_text)
            else:
                source = "fallback"
                answer = FALLBACK.format(whatsapp=_whatsapp())
        except Exception as e:
            log.error(f"Chatbot error: {e}")
            try:
                if HF_API_KEY:
                    source = "huggingface"
                    answer = await _deep_answer_hf(message, history_text)
            except Exception as hf_error:
                log.error(f"Hugging Face fallback error: {hf_error}")
                source = "fallback"
                answer = FALLBACK.format(whatsapp=_whatsapp())

        if not answer or len(answer.strip()) < 10:
            source = "fallback"
            answer = FALLBACK.format(whatsapp=_whatsapp())

    # ── Cache the response (stateless only, non-fallback) ─────
    if source != "fallback" and not history_text:
        try:
            from cache.redis_client import cache_set
            await cache_set(_cache_key(message), {"response": answer, "intent": intent}, ttl=600)
        except Exception:
            pass

    # ── Log to Supabase ───────────────────────────────────────
    try:
        await log_query(
            query=message,
            intent=intent,
            response=answer,
            user_id=request.user_id,
        )
    except Exception as e:
        log.warning(f"Failed to log query: {e}")

    return ChatResponse(
        response=answer,
        intent=intent,
        source=source,
        session_id=request.session_id,
    )


@router.get("/suggestions", summary="Get suggested starter questions")
async def suggestions():
    """Return curated starter questions shown in the SmartBot UI."""
    return {
        "suggestions": [
            "Hello! What can PRATHOMIX do for my business?",
            "Tell me about your AI chatbot services.",
            "What products do you offer?",
            "Can you build a custom SaaS app for us?",
            "Who is the founder of PRATHOMIX?",
            "How quickly can you deliver an MVP?",
            "What's the difference between your products?",
            "Tell me about the Medical AI Assistant.",
            "How do I get in touch with your team?",
            "What's your pricing structure?",
        ]
    }
