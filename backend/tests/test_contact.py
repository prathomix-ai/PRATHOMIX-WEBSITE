"""Contact form endpoint tests."""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_contact_valid():
    r = client.post("/api/contact/", json={
        "name":    "Test User",
        "email":   "test@example.com",
        "subject": "Test",
        "message": "Hello from the test suite!",
    })
    # 200 if Supabase configured, 503 otherwise — both acceptable
    assert r.status_code in (200, 503)
    if r.status_code == 200:
        assert "message" in r.json()


def test_contact_invalid_email():
    r = client.post("/api/contact/", json={
        "name":    "Bad Email",
        "email":   "not-an-email",
        "message": "Hello",
    })
    assert r.status_code == 422


def test_contact_missing_message():
    r = client.post("/api/contact/", json={
        "name":  "No Message",
        "email": "user@example.com",
    })
    assert r.status_code == 422
