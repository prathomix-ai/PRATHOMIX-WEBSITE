#!/usr/bin/env python3
"""
Environment variable validator for PRATHOMIX.
Run before deploying: python3 scripts/validate_env.py

Exits with code 1 if any required variable is missing.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / "backend" / ".env")

REQUIRED = {
    "GROQ_API_KEY":              "Groq API — get from https://console.groq.com",
    "GEMINI_API_KEY":            "Gemini API — get from https://aistudio.google.com",
    "SUPABASE_URL":              "Supabase project URL — Settings → API",
    "SUPABASE_SERVICE_ROLE_KEY": "Supabase service role key — Settings → API",
    "SUPABASE_JWT_SECRET":       "Supabase JWT secret — Settings → API → JWT Secret",
}

OPTIONAL = {
    "ADMIN_EMAIL":     "Admin email (defaults to pratham@prathomix.xyz)",
    "COMPANY_EMAIL":   "Company contact email",
    "WHATSAPP_LINK":   "WhatsApp URL for fallback",
    "ALLOWED_ORIGINS": "Comma-separated CORS origins",
    "LOG_LEVEL":       "Logging level (INFO/DEBUG/WARNING)",
    "ENV":             "Environment (development/production)",
}

def check():
    missing = []
    warnings = []

    print("\n🔍  PRATHOMIX Environment Check\n" + "─" * 40)

    for key, desc in REQUIRED.items():
        val = os.getenv(key, "")
        if not val or val.startswith("your_"):
            missing.append((key, desc))
            print(f"  ❌  {key:<35} MISSING")
        else:
            masked = val[:6] + "…" + val[-4:] if len(val) > 12 else "****"
            print(f"  ✅  {key:<35} {masked}")

    print()
    for key, desc in OPTIONAL.items():
        val = os.getenv(key, "")
        if not val:
            warnings.append((key, desc))
            print(f"  ⚠️   {key:<35} not set ({desc})")
        else:
            print(f"  ✅  {key:<35} set")

    print()
    if missing:
        print(f"❌  {len(missing)} required variable(s) missing:\n")
        for key, desc in missing:
            print(f"   {key}")
            print(f"   → {desc}\n")
        sys.exit(1)

    if warnings:
        print(f"⚠️   {len(warnings)} optional variable(s) not set — defaults will be used.")

    print("✅  All required environment variables are set. Ready to deploy!\n")

if __name__ == "__main__":
    check()
