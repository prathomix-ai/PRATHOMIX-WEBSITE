"""Projects CRUD — public read, admin write."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import require_admin
from database.supabase_client import get_client

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectIn(BaseModel):
    name: str
    description: str | None = None
    github_url: str | None  = None
    live_url: str | None    = None
    tags: list[str]         = []


class ProjectPatch(BaseModel):
    name: str | None        = None
    description: str | None = None
    github_url: str | None  = None
    live_url: str | None    = None
    tags: list[str] | None  = None


@router.get("/")
async def list_projects(limit: int = 20, offset: int = 0):
    try:
        client = get_client()
        result = (
            client.table("projects").select("*")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
    except EnvironmentError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return {"projects": result.data or []}


@router.post("/")
async def create_project(body: ProjectIn, _=Depends(require_admin)):
    client = get_client()
    result = client.table("projects").insert(body.model_dump()).execute()
    return {"project": result.data[0] if result.data else {}}


@router.patch("/{project_id}")
async def update_project(project_id: str, body: ProjectPatch, _=Depends(require_admin)):
    client = get_client()
    patch = {k: v for k, v in body.model_dump().items() if v is not None}
    if not patch:
        raise HTTPException(status_code=400, detail="Nothing to update.")
    result = client.table("projects").update(patch).eq("id", project_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Project not found.")
    return {"project": result.data[0]}


@router.delete("/{project_id}")
async def delete_project(project_id: str, _=Depends(require_admin)):
    get_client().table("projects").delete().eq("id", project_id).execute()
    return {"message": "Deleted."}
