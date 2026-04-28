"""
Supabase client initialisation + helper functions.

Required tables in your Supabase project:

  chatbot_logs
    id          uuid primary key default gen_random_uuid()
    user_id     uuid references auth.users(id) on delete set null
    query       text not null
    intent      text
    response    text
    resolved    boolean default false
    created_at  timestamptz default now()

  projects
    id          uuid primary key default gen_random_uuid()
    name        text not null
    description text
    github_url  text
    created_at  timestamptz default now()
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

_client: Client | None = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            raise EnvironmentError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        _client = create_client(url, key)
    return _client


async def log_query(
    query: str,
    intent: str = "",
    response: str = "",
    user_id: str | None = None,
) -> dict:
    """Insert a chatbot interaction into the chatbot_logs table."""
    client = get_client()
    payload = {
        "query": query,
        "intent": intent,
        "response": response,
        "resolved": bool(response),
    }
    if user_id:
        payload["user_id"] = user_id

    result = client.table("chatbot_logs").insert(payload).execute()
    return result.data[0] if result.data else {}


async def get_unresolved_leads(limit: int = 50) -> list[dict]:
    """Fetch unresolved chatbot leads for the admin dashboard."""
    client = get_client()
    result = (
        client.table("chatbot_logs")
        .select("*")
        .eq("resolved", False)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []
