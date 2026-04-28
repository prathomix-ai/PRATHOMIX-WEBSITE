"""Contact form — persists to Supabase, returns confirmation."""
import os
from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from database.supabase_client import get_client
from dotenv import load_dotenv

load_dotenv()
router = APIRouter(prefix="/contact", tags=["contact"])


class ContactIn(BaseModel):
    name: str
    email: EmailStr
    subject: str | None = None
    message: str


@router.post("/")
async def submit_contact(body: ContactIn):
    try:
        get_client().table("contact_submissions").insert({
            "name":    body.name,
            "email":   body.email,
            "subject": body.subject or "General enquiry",
            "message": body.message,
        }).execute()
    except Exception as e:
        print(f"[contact] DB insert failed: {e}")

    return {
        "message":       "Thank you! We will respond within 24 hours.",
        "company_email": os.getenv("COMPANY_EMAIL", "prathomix@gmail.com"),
        "whatsapp":      os.getenv("WHATSAPP_LINK",  "https://wa.me/919887754009"),
    }
