"""
PRATHOMIX Backend — FastAPI v1.4.0
Run: uvicorn main:app --reload --port 8000
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from dotenv import load_dotenv

from api.chatbot   import router as chatbot_router
from api.leads     import router as leads_router
from api.projects  import router as projects_router
from api.contact   import router as contact_router
from api.analytics import router as analytics_router
from api.webhooks  import router as webhooks_router
from api.payments  import router as payments_router
from api.admin     import router as admin_router
from api.search    import router as search_router

load_dotenv()

app = FastAPI(
    title="PRATHOMIX API",
    description=(
        "Backend for the PRATHOMIX SaaS platform.\n\n"
        "**Company:** prathomix@gmail.com  ·  **Founder:** founder.prathomix@gmail.com"
    ),
    version="1.4.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    contact={"name": "PRATHOMIX Support", "email": "prathomix@gmail.com"},
    license_info={"name": "MIT"},
)

origins = [
    "http://localhost:5173",
    "http://localhost:8000",
    "https://prathomix.vercel.app",
    "https://prathomix.xyz",
    "https://www.prathomix.xyz",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.getenv("ENV") == "production":
    app.add_middleware(TrustedHostMiddleware,
        allowed_hosts=["prathomix.xyz", "www.prathomix.xyz", "api.prathomix.xyz"])

for router in [
    chatbot_router, leads_router, projects_router, contact_router,
    analytics_router, webhooks_router, payments_router, admin_router, search_router,
]:
    app.include_router(router, prefix="/api")


@app.get("/api/health",  tags=["system"])
async def health():
    return {"status": "operational", "platform": "PRATHOMIX", "version": "1.4.0",
            "env": os.getenv("ENV", "development")}

@app.get("/api/version", tags=["system"])
async def version():
    return {"version": "1.4.0"}

@app.get("/", include_in_schema=False)
async def root():
    return {"message": "PRATHOMIX API is live", "docs": "/api/docs"}
