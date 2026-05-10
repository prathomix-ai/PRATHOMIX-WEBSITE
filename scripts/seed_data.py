#!/usr/bin/env python3
"""
Seed the PRATHOMIX Supabase database with demo data.

Run:  python3 scripts/seed_data.py
Env:  Reads from backend/.env (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)

Seeds:
  - 5 sample projects
  - 3 sample chatbot logs
  - 5 sample analytics events
"""
import os, sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

try:
    from supabase import create_client
except ImportError:
    print("Install supabase: pip install supabase")
    sys.exit(1)

URL = os.getenv("SUPABASE_URL", "")
KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

if not URL or not KEY or URL.startswith("your_"):
    print("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env")
    sys.exit(1)

client = create_client(URL, KEY)

PROJECTS = [
    {"name": "Mix AI",  "description": "Multi-model AI chatbot engine for enterprise support",          "github_url": "https://github.com/prathomix/Mix AI",  "tags": ["AI", "Groq", "Gemini", "FastAPI"]},
    {"name": "FlowMind",  "description": "Visual drag-and-drop AI workflow automation studio",            "github_url": "https://github.com/prathomix/flowmind",  "tags": ["Automation", "Python", "n8n"]},
    {"name": "InsightAI", "description": "Natural language business intelligence dashboard",              "github_url": "https://github.com/prathomix/insightai", "tags": ["Analytics", "AI", "React"]},
    {"name": "VaultAuth", "description": "Zero-trust authentication layer with MFA and RBAC",            "github_url": "https://github.com/prathomix/vaultauth", "tags": ["Security", "Supabase", "JWT"]},
    {"name": "SprintKit", "description": "AI project management co-pilot with GitHub sync",               "github_url": "https://github.com/prathomix/sprintkit", "tags": ["Productivity", "AI", "GitHub"]},
]

LOGS = [
    {"query": "What chatbot services do you offer?",       "intent": "service_info",    "response": "We build AI chatbots using Groq and Gemini...", "resolved": True},
    {"query": "How long does a SaaS build take?",          "intent": "general_faq",     "response": "Typically 3–6 weeks from kickoff to launch...", "resolved": True},
    {"query": "I need to automate my invoicing process",   "intent": "complex_problem", "response": "That's a great use case for FlowMind...",       "resolved": False},
]

EVENTS = [
    {"event": "page_view",   "page": "/",         "session_id": "demo001"},
    {"event": "page_view",   "page": "/services", "session_id": "demo002"},
    {"event": "cta_clicked", "page": "/pricing",  "session_id": "demo001", "properties": {"plan": "pro_monthly"}},
    {"event": "page_view",   "page": "/products", "session_id": "demo003"},
    {"event": "bot_opened",  "page": "/",         "session_id": "demo002"},
]

def seed(table, rows, label):
    try:
        client.table(table).insert(rows).execute()
        print(f"  ✓  Seeded {len(rows)} {label}")
    except Exception as e:
        print(f"  ✗  Failed to seed {label}: {e}")

print("\n🌱  PRATHOMIX — Seeding database...\n")
seed("projects",         PROJECTS, "projects")
seed("chatbot_logs",     LOGS,     "chatbot logs")
seed("analytics_events", EVENTS,   "analytics events")
print("\n✅  Seed complete!\n")
