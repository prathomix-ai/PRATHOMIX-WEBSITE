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

# ── Lazy client factories ────────────────────────────────────

def _groq_client():
    from openai import OpenAI
    return OpenAI(
        api_key=os.getenv("HUGGINGFACE_API_KEY"),
        base_url="https://api-inference.huggingface.co/v1/"
    )

def _gemini():
    import google.generativeai as genai
    genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
    return genai.GenerativeModel("gemini-1.5-flash")

# ── PRATHOMIX context ─────────────────────────────────────────

SYSTEM_CONTEXT = """
You are SmartBot, the AI assistant for PRATHOMIX — an elite AI-powered SaaS studio.

PRATHOMIX Services:
• AI Chatbot Development (Groq + Gemini)
• Process Automation & AI Workflows
• Full-Stack SaaS Development (React + FastAPI + Supabase)
• AI Analytics & Business Intelligence
• API Integration & System Architecture
• Security Audit & Hardening

Products: NexusBot · FlowMind · InsightAI · VaultAuth · SprintKit

Contact:
    Company : prathomix@gmail.com
    Founder : founder.prathomix@gmail.com
  WhatsApp: {whatsapp}

Guidelines:
- Be concise, warm, and professional
- Map user problems to PRATHOMIX services
- For complex business problems, give a structured answer (Challenge → Solution → Next step)
- If you cannot help, direct to email or WhatsApp with a friendly message
- Never make up pricing — direct to /pricing or contact
"""

FALLBACK = (
    "I want to make sure you get the right answer.\n\n"
    "Please contact our team:\n"
    "Email: prathomix@gmail.com\n"
    "WhatsApp: {whatsapp}\n\n"
    "We reply within 24 hours."
)

SIMPLE_INTENTS = {
    "greeting", "pricing_query", "product_info",
    "service_info", "contact_request", "general_faq",
}

RULE_RESPONSES = {
    "greeting": "Hi! I am SmartBot. Ask me about services, products, or pricing.",
    "pricing": "Pricing is on the /pricing page. If you want help, tell me your team size and goals.",
    "services": "We build AI chatbots, automation, and full-stack SaaS products. Tell me what you need.",
    "products": "Our products include NexusBot, FlowMind, InsightAI, VaultAuth, and SprintKit.",
    "contact": "You can email prathomix@gmail.com or WhatsApp us. We reply within 24 hours.",
}


def _rule_based_answer(message: str) -> tuple[str, str]:
    msg = message.lower()
    if any(word in msg for word in ["hi", "hello", "hey"]):
        return "greeting", RULE_RESPONSES["greeting"]
    if any(word in msg for word in ["price", "pricing", "cost", "plan"]):
        return "pricing_query", RULE_RESPONSES["pricing"]
    if any(word in msg for word in ["service", "services", "offer", "build"]):
        return "service_info", RULE_RESPONSES["services"]
    if any(word in msg for word in ["product", "products", "nexus", "flowmind", "insight", "vault", "sprint"]):
        return "product_info", RULE_RESPONSES["products"]
    if any(word in msg for word in ["contact", "email", "whatsapp", "call"]):
        return "contact_request", RULE_RESPONSES["contact"]
    return "general_faq", "PRATHOMIX is a generative intelligence engine. Tell me your goal and I will guide you."

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

async def _parse_intent_groq(message: str, history_text: str) -> tuple[str, str]:
    client  = _groq_client()
    context = SYSTEM_CONTEXT.format(whatsapp=_whatsapp())

    conv_block = ""
    if history_text:
        conv_block = f"\n\nConversation so far:\n{history_text}\n"

    system = (
        context + conv_block + "\n\n"
        "TASK: Classify the user's latest message into ONE intent:\n"
        "  greeting | pricing_query | product_info | service_info | "
        "contact_request | general_faq | complex_problem | off_topic\n\n"
        "Use the conversation history for context.\n"
        "Respond ONLY as valid JSON: "
        '{"intent": "<intent>", "answer": "<concise answer or empty>"}'
    )

    completion = client.chat.completions.create(
        model="meta-llama/Meta-Llama-3-8B-Instruct",
        messages=[
            {"role": "system", "content": system},
            {"role": "user",   "content": message},
        ],
        temperature=0.3,
        max_tokens=600,
    )

    raw = completion.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()

    parsed = json.loads(raw)
    return parsed.get("intent", "general_faq"), parsed.get("answer", "")


async def _deep_answer_gemini(message: str, history_text: str) -> str:
    model   = _gemini()
    context = SYSTEM_CONTEXT.format(whatsapp=_whatsapp())

    conv_block = f"\n\nConversation history:\n{history_text}\n" if history_text else ""

    prompt = (
        f"{context}{conv_block}\n\n"
        f"User's latest message:\n\"{message}\"\n\n"
        "Provide a detailed, helpful response that:\n"
        "1. Acknowledges their specific challenge\n"
        "2. Maps it to the most relevant PRATHOMIX service(s)\n"
        "3. Briefly explains the approach\n"
        "4. Ends with a clear CTA (email or WhatsApp)\n\n"
        "Max 200 words. Warm and professional."
    )

    response = model.generate_content(prompt)
    return response.text.strip()

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
    source      = "groq"

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
    try:
        intent, answer = await _parse_intent_groq(message, history_text)

        if intent == "complex_problem" or not answer:
            source = "gemini"
            answer = await _deep_answer_gemini(message, history_text)

        if not answer or len(answer.strip()) < 10:
            source = "fallback"
            answer = FALLBACK.format(whatsapp=_whatsapp())

    except json.JSONDecodeError:
        try:
            source = "gemini"
            answer = await _deep_answer_gemini(message, history_text)
        except Exception as e:
            log.error(f"Gemini fallback error: {e}")
            source = "fallback"
            answer = FALLBACK.format(whatsapp=_whatsapp())

    except Exception as e:
        log.error(f"Chatbot error: {e}")
        try:
            source = "gemini"
            answer = await _deep_answer_gemini(message, history_text)
            intent = "general_faq"
        except Exception as gemini_error:
            log.error(f"Gemini fallback error: {gemini_error}")
            intent, answer = _rule_based_answer(message)
            source = "rule"

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
            "What AI services does PRATHOMIX offer?",
            "How quickly can you build a chatbot?",
            "What's the difference between NexusBot and FlowMind?",
            "Can you integrate with WhatsApp Business?",
            "How much does the Pro plan cost?",
            "How do I get started?",
        ]
    }
