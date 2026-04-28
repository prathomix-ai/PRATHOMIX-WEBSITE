"""
Chatbot endpoint unit tests.
Uses monkeypatching to avoid real API calls.
"""
import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def _mock_groq_response(intent="service_info", answer="We offer AI chatbot development."):
    import json
    mock = MagicMock()
    mock.choices = [MagicMock()]
    mock.choices[0].message.content = json.dumps({"intent": intent, "answer": answer})
    return mock


@patch("api.chatbot._groq_client")
@patch("api.chatbot.log_query", new_callable=AsyncMock)
def test_chat_basic(mock_log, mock_groq_cls):
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = _mock_groq_response()
    mock_groq_cls.return_value = mock_client

    r = client.post("/api/chatbot/chat", json={"message": "What services do you offer?"})
    assert r.status_code == 200
    data = r.json()
    assert "response" in data
    assert "intent" in data
    assert len(data["response"]) > 0


@patch("api.chatbot._groq_client")
@patch("api.chatbot.log_query", new_callable=AsyncMock)
def test_chat_fallback_on_json_error(mock_log, mock_groq_cls):
    mock_client = MagicMock()
    mock_client.chat.completions.create.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content="not json at all"))]
    )
    mock_groq_cls.return_value = mock_client

    with patch("api.chatbot._deep_answer_gemini", new_callable=AsyncMock) as mock_gemini:
        mock_gemini.return_value = "Here is a detailed Gemini answer."
        r = client.post("/api/chatbot/chat", json={"message": "Complex question here"})
    assert r.status_code == 200
    assert r.json()["source"] in ("gemini", "fallback")


def test_chat_empty_message_rejected():
    r = client.post("/api/chatbot/chat", json={"message": "   "})
    assert r.status_code == 400
