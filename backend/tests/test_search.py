"""Search endpoint tests."""
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_search_requires_query():
    r = client.get("/api/search/")
    assert r.status_code == 422   # missing q param


def test_search_too_short():
    r = client.get("/api/search/?q=a")
    assert r.status_code == 422   # min_length=2


def test_search_services():
    r = client.get("/api/search/?q=chatbot&type=services")
    assert r.status_code == 200
    data = r.json()
    assert "results" in data
    assert data["query"] == "chatbot"
    # At least one service should match "chatbot"
    types = [res["type"] for res in data["results"]]
    assert "service" in types


def test_search_products():
    r = client.get("/api/search/?q=nexus&type=products")
    assert r.status_code == 200
    data = r.json()
    assert any(r["title"] == "Mix AI" for r in data["results"])


def test_search_all():
    r = client.get("/api/search/?q=AI")
    assert r.status_code == 200
    data = r.json()
    assert "total" in data
    assert isinstance(data["results"], list)


def test_chatbot_suggestions():
    r = client.get("/api/chatbot/suggestions")
    assert r.status_code == 200
    data = r.json()
    assert "suggestions" in data
    assert len(data["suggestions"]) >= 3
