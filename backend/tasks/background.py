"""
Background task helpers for FastAPI.
Uses FastAPI's built-in BackgroundTasks for lightweight jobs.
For heavy workloads, swap with Celery + Redis or ARQ.

Usage in a route:
  from fastapi import BackgroundTasks
  from tasks.background import send_welcome_email_task, log_event_task

  @router.post("/register")
  async def register(data: RegisterIn, bg: BackgroundTasks):
      user = await create_user(data)
      bg.add_task(send_welcome_email_task, user.email, user.name)
      bg.add_task(log_event_task, "user_registered", {"email": user.email})
      return user
"""
import asyncio
from utils.logger import get_logger
from utils.email  import send_email, welcome_email, contact_confirmation_email

log = get_logger("tasks")


async def send_welcome_email_task(email: str, name: str) -> None:
    """Send welcome email after signup."""
    log.info(f"[bg] Sending welcome email to {email}")
    success = await send_email(
        to=email,
        subject="Welcome to PRATHOMIX!",
        html=welcome_email(name),
    )
    if success:
        log.info(f"[bg] Welcome email sent to {email}")
    else:
        log.warning(f"[bg] Failed to send welcome email to {email}")


async def send_contact_confirmation_task(email: str, name: str) -> None:
    """Confirm contact form receipt to the sender."""
    log.info(f"[bg] Sending contact confirmation to {email}")
    await send_email(
        to=email,
        subject="We received your message — PRATHOMIX",
        html=contact_confirmation_email(name),
    )


async def log_event_task(event: str, properties: dict | None = None) -> None:
    """Log an analytics event from a background task."""
    try:
        from database.supabase_client import get_client
        get_client().table("analytics_events").insert({
            "event":      event,
            "properties": properties or {},
            "session_id": "server",
        }).execute()
        log.info(f"[bg] Event logged: {event}")
    except Exception as e:
        log.error(f"[bg] Failed to log event {event}: {e}")


async def notify_admin_new_lead_task(query: str, user_id: str | None = None) -> None:
    """Notify admin email of a new SmartBot lead."""
    import os
    admin_email = os.getenv("ADMIN_EMAIL", "founder.prathomix@gmail.com")
    html = f"""
<div style="font-family:sans-serif;color:#e5e7eb;background:#030712;padding:24px;">
  <h2 style="color:#fff;">New SmartBot Lead</h2>
  <p><strong>Query:</strong> {query}</p>
  {'<p><strong>User ID:</strong> ' + user_id + '</p>' if user_id else ''}
  <p style="color:#6b7280;font-size:12px;">PRATHOMIX Admin Alert</p>
</div>"""
    await send_email(
        to=admin_email,
        subject="New SmartBot Lead — PRATHOMIX",
        html=html,
    )
