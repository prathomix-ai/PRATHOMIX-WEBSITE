"""
Inbound webhook receiver.
Verifies signatures and dispatches to handlers.

Supported sources:
  - Stripe   (payment events)
  - Supabase (database webhooks)
  - Generic  (any HMAC-signed POST)

Usage:
  POST /api/webhooks/stripe    — Stripe payment events
  POST /api/webhooks/supabase  — Supabase DB trigger events
  POST /api/webhooks/generic   — HMAC-verified generic hook
"""
import os
import hmac
import hashlib
import json
from fastapi import APIRouter, Request, HTTPException, Header
from utils.logger import get_logger

router = APIRouter(prefix="/webhooks", tags=["webhooks"])
log    = get_logger("webhooks")

STRIPE_WEBHOOK_SECRET   = os.getenv("STRIPE_WEBHOOK_SECRET", "")
SUPABASE_WEBHOOK_SECRET = os.getenv("SUPABASE_WEBHOOK_SECRET", "")
GENERIC_WEBHOOK_SECRET  = os.getenv("GENERIC_WEBHOOK_SECRET", "")


def _verify_hmac(payload: bytes, signature: str, secret: str) -> bool:
    """Verify HMAC-SHA256 signature."""
    if not secret:
        return True  # Skip verification if secret not configured (dev only)
    expected = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature.lstrip("sha256="))


# ── Stripe ────────────────────────────────────────────────────
@router.post("/stripe", summary="Stripe payment webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(None, alias="stripe-signature"),
):
    body = await request.body()

    if STRIPE_WEBHOOK_SECRET and not _verify_hmac(body, stripe_signature or "", STRIPE_WEBHOOK_SECRET):
        raise HTTPException(status_code=400, detail="Invalid Stripe signature.")

    try:
        event = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    event_type = event.get("type", "unknown")
    log.info(f"Stripe event received: {event_type}")

    # ── Dispatch table ──────────────────────────────────────
    handlers = {
        "payment_intent.succeeded":   _handle_payment_succeeded,
        "customer.subscription.created": _handle_subscription_created,
        "customer.subscription.deleted": _handle_subscription_cancelled,
        "invoice.payment_failed":     _handle_payment_failed,
    }

    handler = handlers.get(event_type)
    if handler:
        await handler(event.get("data", {}).get("object", {}))
    else:
        log.info(f"No handler for Stripe event: {event_type}")

    return {"received": True}


async def _handle_payment_succeeded(obj: dict):
    amount   = obj.get("amount", 0) / 100
    currency = obj.get("currency", "usd").upper()
    email    = obj.get("receipt_email") or obj.get("customer_email", "unknown")
    log.info(f"Payment succeeded: {amount} {currency} from {email}")
    # TODO: Update subscription status in Supabase
    # TODO: Send confirmation email via send_email()


async def _handle_subscription_created(obj: dict):
    customer_id = obj.get("customer")
    plan        = obj.get("plan", {}).get("nickname", "Pro")
    log.info(f"Subscription created: customer={customer_id} plan={plan}")
    # TODO: Update profiles table with plan info


async def _handle_subscription_cancelled(obj: dict):
    customer_id = obj.get("customer")
    log.info(f"Subscription cancelled: customer={customer_id}")
    # TODO: Downgrade user to free tier


async def _handle_payment_failed(obj: dict):
    customer_id = obj.get("customer")
    log.info(f"Payment failed: customer={customer_id}")
    # TODO: Send dunning email


# ── Supabase DB webhook ──────────────────────────────────────
@router.post("/supabase", summary="Supabase database webhook")
async def supabase_webhook(
    request: Request,
    x_webhook_secret: str | None = Header(None, alias="x-webhook-secret"),
):
    if SUPABASE_WEBHOOK_SECRET and x_webhook_secret != SUPABASE_WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid webhook secret.")

    payload = await request.json()
    table   = payload.get("table", "unknown")
    event   = payload.get("type",  "unknown")
    record  = payload.get("record", {})

    log.info(f"Supabase webhook: {event} on {table}")
    return {"table": table, "event": event, "processed": True}


# ── Generic HMAC webhook ─────────────────────────────────────
@router.post("/generic", summary="Generic HMAC-signed webhook")
async def generic_webhook(
    request: Request,
    x_signature: str | None = Header(None, alias="x-signature"),
):
    body = await request.body()
    if not _verify_hmac(body, x_signature or "", GENERIC_WEBHOOK_SECRET):
        raise HTTPException(status_code=400, detail="Invalid signature.")

    try:
        payload = json.loads(body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON.")

    log.info(f"Generic webhook: event={payload.get('event', 'unknown')}")
    return {"received": True}
