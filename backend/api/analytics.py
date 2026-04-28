"""
Privacy-first analytics endpoint.
Stores anonymous event data in Supabase.

Supabase table (add to schema.sql):
  create table if not exists public.analytics_events (
    id         uuid primary key default gen_random_uuid(),
    event      text not null,
    page       text,
    properties jsonb,
    session_id text,
    referrer   text,
    created_at timestamptz not null default now()
  );
  alter table public.analytics_events enable row level security;
  create policy \"Service full\"
    on public.analytics_events for all using (auth.role() = 'service_role');
"""
from fastapi import APIRouter, Request
from pydantic import BaseModel
from database.supabase_client import get_client

router = APIRouter(prefix="/analytics", tags=["analytics"])


class EventIn(BaseModel):
    event: str
    page: str | None       = None
    properties: dict | None = None
    session_id: str | None  = None
    referrer: str | None    = None


@router.post("/event", summary="Track an anonymous analytics event")
async def track_event(body: EventIn, request: Request):
    try:
        get_client().table("analytics_events").insert({
            "event":      body.event,
            "page":       body.page,
            "properties": body.properties or {},
            "session_id": body.session_id,
            "referrer":   body.referrer,
        }).execute()
    except Exception as e:
        pass  # Never fail the caller due to analytics
    return {"ok": True}


@router.get("/summary", summary="Get event counts (admin only)")
async def get_summary():
    from middleware.auth import require_admin
    client = get_client()
    result = client.rpc("analytics_summary").execute()
    return {"summary": result.data or []}
