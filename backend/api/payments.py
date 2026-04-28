"""
Stripe payment integration stubs.
Replace TODO sections with real Stripe calls once you add
your STRIPE_SECRET_KEY to .env.

Install: pip install stripe
"""
import os
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from middleware.auth import require_auth
from utils.logger import get_logger

router = APIRouter(prefix="/payments", tags=["payments"])
log    = get_logger("payments")

STRIPE_SECRET_KEY     = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY", "")

PRICE_IDS = {
    "pro_monthly": os.getenv("STRIPE_PRICE_PRO_MONTHLY", "price_xxx"),
    "pro_yearly":  os.getenv("STRIPE_PRICE_PRO_YEARLY",  "price_xxx"),
}


class CheckoutRequest(BaseModel):
    plan: str          # "pro_monthly" | "pro_yearly"
    success_url: str
    cancel_url: str


class PortalRequest(BaseModel):
    return_url: str


@router.get("/config", summary="Get Stripe publishable key (public)")
async def get_config():
    return {
        "publishable_key": STRIPE_PUBLISHABLE_KEY,
        "plans": {
            "pro_monthly": {"price_id": PRICE_IDS["pro_monthly"], "amount": 4900, "currency": "usd"},
            "pro_yearly":  {"price_id": PRICE_IDS["pro_yearly"],  "amount": 39900, "currency": "usd"},
        },
    }


@router.post("/create-checkout-session", summary="Create Stripe checkout session")
async def create_checkout_session(body: CheckoutRequest, user: dict = Depends(require_auth)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(
            status_code=503,
            detail="Stripe not configured. Add STRIPE_SECRET_KEY to .env"
        )

    price_id = PRICE_IDS.get(body.plan)
    if not price_id:
        raise HTTPException(status_code=400, detail=f"Unknown plan: {body.plan}")

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{"price": price_id, "quantity": 1}],
            mode="subscription",
            success_url=body.success_url + "?session_id={CHECKOUT_SESSION_ID}",
            cancel_url=body.cancel_url,
            customer_email=user.get("email"),
            metadata={"user_id": user.get("sub")},
        )
        log.info(f"Checkout session created for {user.get('email')}: {session.id}")
        return {"session_id": session.id, "url": session.url}

    except ImportError:
        raise HTTPException(status_code=503, detail="stripe library not installed. Run: pip install stripe")
    except Exception as e:
        log.error(f"Stripe checkout error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-portal-session", summary="Create Stripe billing portal session")
async def create_portal_session(body: PortalRequest, user: dict = Depends(require_auth)):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Stripe not configured.")

    # In production, look up the Stripe customer_id from your profiles table
    customer_id = user.get("stripe_customer_id")
    if not customer_id:
        raise HTTPException(status_code=404, detail="No Stripe customer found for this user.")

    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=body.return_url,
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
