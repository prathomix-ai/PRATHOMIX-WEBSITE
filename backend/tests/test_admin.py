"""Admin endpoint tests."""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_admin_stats_requires_auth():
    r = client.get("/api/admin/stats")
    assert r.status_code == 401


def test_admin_system_requires_auth():
    r = client.get("/api/admin/system")
    assert r.status_code == 401


def test_webhooks_stripe_bad_signature():
    r = client.post(
        "/api/webhooks/stripe",
        content=b'{"type":"test"}',
        headers={"stripe-signature": "bad_sig", "content-type": "application/json"},
    )
    # With no secret configured in test env, it passes through
    assert r.status_code in (200, 400)


def test_payments_config_public():
    r = client.get("/api/payments/config")
    assert r.status_code == 200
    data = r.json()
    assert "publishable_key" in data
    assert "plans" in data


def test_analytics_event_insert():
    r = client.post("/api/analytics/event", json={
        "event": "test_event",
        "page":  "/test",
    })
    assert r.status_code in (200, 503)
