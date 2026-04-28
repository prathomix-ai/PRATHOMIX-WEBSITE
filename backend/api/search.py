"""
Full-text search endpoint — searches projects, blog posts (future),
and services using Postgres full-text search via Supabase.

GET /api/search?q=chatbot&type=projects
"""
from fastapi import APIRouter, Query, HTTPException
from database.supabase_client import get_client
from utils.logger import get_logger

router = APIRouter(prefix="/search", tags=["search"])
log    = get_logger("search")

SERVICES_DATA = [
    {"id": "s1", "title": "AI Chatbot Development",           "desc": "Hyper-contextual chatbots powered by Groq and Gemini", "url": "/services"},
    {"id": "s2", "title": "Process Automation & AI Workflows","desc": "Custom automation pipelines using Python, n8n, and AI APIs", "url": "/services"},
    {"id": "s3", "title": "Full-Stack SaaS Development",      "desc": "React, FastAPI, Supabase — from MVP to production", "url": "/services"},
    {"id": "s4", "title": "AI Analytics & Business Intelligence","desc": "Ask questions in plain English, get actionable insights", "url": "/services"},
    {"id": "s5", "title": "API Integration & System Architecture","desc": "Connect your tools and make your tech stack harmonious", "url": "/services"},
    {"id": "s6", "title": "Security Audit & Hardening",       "desc": "OWASP, penetration testing, JWT, TLS — production-grade security", "url": "/services"},
]

PRODUCTS_DATA = [
    {"id": "p1", "title": "NexusBot",  "desc": "Multi-model chatbot engine combining Groq speed with Gemini depth", "url": "/products"},
    {"id": "p2", "title": "FlowMind",  "desc": "Visual drag-and-drop automation builder with AI logic nodes",       "url": "/products"},
    {"id": "p3", "title": "InsightAI", "desc": "Natural language queries against your business data",                "url": "/products"},
    {"id": "p4", "title": "VaultAuth", "desc": "Zero-trust authentication layer with MFA and RBAC",                  "url": "/products"},
    {"id": "p5", "title": "SprintKit", "desc": "AI project management co-pilot with GitHub sync",                    "url": "/products"},
]


def _text_matches(text: str, query: str) -> bool:
    q = query.lower()
    return any(word in text.lower() for word in q.split())


@router.get("/", summary="Search across projects, services, and products")
async def search(
    q: str = Query(..., min_length=2, max_length=100, description="Search query"),
    type: str = Query("all", description="Filter: all | projects | services | products"),
    limit: int = Query(10, ge=1, le=50),
):
    if not q.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    results = []

    # Search projects in Supabase
    if type in ("all", "projects"):
        try:
            client = get_client()
            result = (
                client.table("projects")
                .select("id, name, description, github_url, tags")
                .limit(limit)
                .execute()
            )
            for p in (result.data or []):
                search_text = f"{p.get('name','')} {p.get('description','')} {' '.join(p.get('tags',[]))}"
                if _text_matches(search_text, q):
                    results.append({
                        "type":  "project",
                        "id":    p["id"],
                        "title": p["name"],
                        "desc":  p.get("description", ""),
                        "url":   p.get("github_url") or "/products",
                        "tags":  p.get("tags", []),
                    })
        except Exception as e:
            log.warning(f"Project search error: {e}")

    # Search static services
    if type in ("all", "services"):
        for s in SERVICES_DATA:
            if _text_matches(f"{s['title']} {s['desc']}", q):
                results.append({"type": "service", **s})

    # Search static products
    if type in ("all", "products"):
        for p in PRODUCTS_DATA:
            if _text_matches(f"{p['title']} {p['desc']}", q):
                results.append({"type": "product", **p})

    return {
        "query":   q,
        "total":   len(results),
        "results": results[:limit],
    }
