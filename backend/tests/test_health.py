"""
Basic smoke tests for the PRATHOMIX API.
Run: pytest backend/tests/ -v
"""
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert "PRATHOMIX" in r.json().get("message", "")


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "operational"
    assert data["platform"] == "PRATHOMIX"


def test_openapi_schema():
    r = client.get("/api/openapi.json")
    assert r.status_code == 200
    assert "PRATHOMIX" in r.json()["info"]["title"]


def test_projects_list_public():
    r = client.get("/api/projects/")
    # Should succeed even without auth (public read)
    assert r.status_code in (200, 503)   # 503 if Supabase not configured


def test_chatbot_empty_message():
    r = client.post("/api/chatbot/chat", json={"message": ""})
    assert r.status_code == 400


def test_leads_requires_auth():
    r = client.get("/api/leads/")
    assert r.status_code == 401


def test_contact_form_validation():
    r = client.post("/api/contact/", json={
        "name": "Test",
        "email": "not-an-email",
        "message": "Hello"
    })
    assert r.status_code == 422   # Pydantic validation error
