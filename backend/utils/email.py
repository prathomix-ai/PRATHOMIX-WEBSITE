"""
Email sender utility using Resend (recommended) or SMTP.

Install: pip install resend   OR   pip install aiosmtplib

Set in .env:
  RESEND_API_KEY=re_xxx
  EMAIL_FROM=noreply@prathomix.xyz

Usage:
  await send_email(
      to="user@example.com",
      subject="Welcome to PRATHOMIX",
      html="<p>Hello!</p>",
  )
"""
import os
from utils.logger import get_logger

log = get_logger("email")

EMAIL_FROM    = os.getenv("EMAIL_FROM",    "noreply@prathomix.xyz")
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")


async def send_email(to: str | list[str], subject: str, html: str, text: str | None = None) -> bool:
    """
    Send an email. Returns True on success, False on failure.
    Never raises — email errors must not crash the caller.
    """
    recipients = [to] if isinstance(to, str) else to

    if RESEND_API_KEY:
        return await _send_via_resend(recipients, subject, html, text)
    else:
        log.warning("RESEND_API_KEY not set — email not sent.")
        log.info(f"[DEV] Would send to {recipients}: {subject}")
        return False


async def _send_via_resend(to: list[str], subject: str, html: str, text: str | None) -> bool:
    try:
        import httpx
        async with httpx.AsyncClient() as client:
            payload = {
                "from":    EMAIL_FROM,
                "to":      to,
                "subject": subject,
                "html":    html,
            }
            if text:
                payload["text"] = text

            resp = await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {RESEND_API_KEY}", "Content-Type": "application/json"},
                json=payload,
                timeout=10,
            )
            resp.raise_for_status()
            log.info(f"Email sent to {to}: {subject}")
            return True
    except Exception as e:
        log.error(f"Failed to send email to {to}: {e}")
        return False


# ── Email templates ───────────────────────────────────────────

def welcome_email(name: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<body style="font-family: 'DM Sans', sans-serif; background: #030712; color: #e5e7eb; padding: 40px 20px; max-width: 560px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 32px;">
    <h1 style="font-size: 28px; font-weight: 800; background: linear-gradient(135deg, #0a9090, #4040b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      PRATHOMIX
    </h1>
  </div>
  <h2 style="font-size: 22px; color: #fff;">Welcome, {name}!</h2>
  <p style="color: #9ca3af; line-height: 1.6;">
    You've just joined an elite community of builders who use AI to get things done faster.
  </p>
  <p style="color: #9ca3af; line-height: 1.6;">
    Here's what to do next:
  </p>
  <ul style="color: #9ca3af; line-height: 2;">
    <li>Try <strong style="color: #fff;">SmartBot</strong> — describe a business problem</li>
    <li>Explore our <strong style="color: #fff;">Products</strong> page</li>
    <li>Read our <strong style="color: #fff;">Blog</strong> for engineering insights</li>
  </ul>
  <div style="text-align: center; margin-top: 32px;">
    <a href="https://prathomix.xyz" style="background: linear-gradient(135deg, #0a9090, #4040b8); color: #fff; padding: 12px 28px; border-radius: 12px; text-decoration: none; font-weight: 600;">
      Explore PRATHOMIX
    </a>
  </div>
  <p style="color: #4b5563; font-size: 12px; text-align: center; margin-top: 40px;">
    PRATHOMIX · prathomix@gmail.com · Jaipur, India
  </p>
</body>
</html>
"""


def contact_confirmation_email(name: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<body style="font-family: 'DM Sans', sans-serif; background: #030712; color: #e5e7eb; padding: 40px 20px; max-width: 560px; margin: 0 auto;">
  <h2 style="color: #fff;">Hi {name}, we got your message!</h2>
  <p style="color: #9ca3af; line-height: 1.6;">
    Thank you for reaching out to PRATHOMIX. We typically respond within <strong style="color: #fff;">24 hours</strong>.
  </p>
  <p style="color: #9ca3af;">
    In the meantime, feel free to explore our services or try SmartBot for instant answers.
  </p>
  <p style="color: #6b7280; font-size: 13px; margin-top: 32px;">
    — The PRATHOMIX Team<br/>
    prathomix@gmail.com
  </p>
</body>
</html>
"""
