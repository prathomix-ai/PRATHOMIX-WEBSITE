"""
Advanced admin endpoints — analytics, system stats, bulk ops.
All routes require admin authentication.
"""
import os
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends
from middleware.auth import require_admin
from database.supabase_client import get_client
from utils.logger import get_logger

router = APIRouter(prefix="/admin", tags=["admin"])
log    = get_logger("admin")


@router.get("/stats", summary="Platform statistics overview")
async def platform_stats(_=Depends(require_admin)):
    client = get_client()

    def safe_count(table: str) -> int:
        try:
            r = client.table(table).select("id", count="exact").execute()
            return r.count or 0
        except Exception:
            return -1

    def recent_count(table: str, hours: int = 24) -> int:
        try:
            since = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
            r = client.table(table).select("id", count="exact").gte("created_at", since).execute()
            return r.count or 0
        except Exception:
            return -1

    return {
        "totals": {
            "chatbot_logs":         safe_count("chatbot_logs"),
            "projects":             safe_count("projects"),
            "contact_submissions":  safe_count("contact_submissions"),
            "analytics_events":     safe_count("analytics_events"),
            "profiles":             safe_count("profiles"),
        },
        "last_24h": {
            "chatbot_logs":        recent_count("chatbot_logs"),
            "contact_submissions": recent_count("contact_submissions"),
            "analytics_events":    recent_count("analytics_events"),
        },
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/analytics/top-events", summary="Top analytics events")
async def top_events(limit: int = 20, _=Depends(require_admin)):
    client = get_client()
    try:
        result = client.rpc("analytics_summary").execute()
        return {"events": (result.data or [])[:limit]}
    except Exception as e:
        return {"events": [], "error": str(e)}


@router.get("/analytics/top-pages", summary="Most visited pages")
async def top_pages(limit: int = 10, _=Depends(require_admin)):
    client = get_client()
    try:
        result = (
            client.table("analytics_events")
            .select("page")
            .eq("event", "page_view")
            .execute()
        )
        from collections import Counter
        counts = Counter(r["page"] for r in (result.data or []) if r.get("page"))
        pages  = [{"page": p, "views": c} for p, c in counts.most_common(limit)]
        return {"pages": pages}
    except Exception as e:
        return {"pages": [], "error": str(e)}


@router.get("/intents", summary="Top chatbot intents")
async def top_intents(limit: int = 10, _=Depends(require_admin)):
    client = get_client()
    try:
        result = client.table("chatbot_logs").select("intent").execute()
        from collections import Counter
        counts  = Counter(r["intent"] for r in (result.data or []) if r.get("intent"))
        intents = [{"intent": k, "count": v} for k, v in counts.most_common(limit)]
        return {"intents": intents}
    except Exception as e:
        return {"intents": [], "error": str(e)}


@router.delete("/leads/bulk-resolve", summary="Mark all open leads as resolved")
async def bulk_resolve_leads(_=Depends(require_admin)):
    client = get_client()
    result = client.table("chatbot_logs").update({"resolved": True}).eq("resolved", False).execute()
    count  = len(result.data or [])
    log.info(f"Bulk resolved {count} leads")
    return {"resolved": count}


@router.get("/system", summary="System environment info")
async def system_info(_=Depends(require_admin)):
    import sys, platform
    return {
        "python_version": sys.version,
        "platform":       platform.system(),
        "env":            os.getenv("ENV", "development"),
        "log_level":      os.getenv("LOG_LEVEL", "INFO"),
        "supabase_url":   (os.getenv("SUPABASE_URL") or "")[:30] + "…",
        "groq_key_set":   bool(os.getenv("GROQ_API_KEY")),
        "gemini_key_set": bool(os.getenv("GEMINI_API_KEY")),
        "stripe_key_set": bool(os.getenv("STRIPE_SECRET_KEY")),
        "resend_key_set": bool(os.getenv("RESEND_API_KEY")),
    }
