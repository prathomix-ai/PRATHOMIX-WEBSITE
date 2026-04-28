"""Admin-only leads management API."""
from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import require_admin
from database.supabase_client import get_client

router = APIRouter(prefix="/leads", tags=["leads"])


@router.get("/")
async def list_leads(limit: int = 50, resolved: bool | None = None, _=Depends(require_admin)):
    client = get_client()
    q = client.table("chatbot_logs").select("*").order("created_at", desc=True).limit(limit)
    if resolved is not None:
        q = q.eq("resolved", resolved)
    result = q.execute()
    return {"leads": result.data or [], "total": len(result.data or [])}


@router.patch("/{lead_id}/resolve")
async def resolve_lead(lead_id: str, _=Depends(require_admin)):
    client = get_client()
    result = client.table("chatbot_logs").update({"resolved": True}).eq("id", lead_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Lead not found.")
    return {"message": "Resolved.", "lead": result.data[0]}


@router.delete("/{lead_id}")
async def delete_lead(lead_id: str, _=Depends(require_admin)):
    client = get_client()
    client.table("chatbot_logs").delete().eq("id", lead_id).execute()
    return {"message": "Deleted."}
