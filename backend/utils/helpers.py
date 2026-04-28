"""
General utility helpers for the PRATHOMIX backend.
"""
import re
import hashlib
import secrets
from datetime import datetime, timezone


def utcnow() -> datetime:
    """Timezone-aware UTC timestamp."""
    return datetime.now(timezone.utc)


def slugify(text: str) -> str:
    """Convert a string to a URL-safe slug."""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text


def truncate(text: str, max_len: int = 200, suffix: str = '…') -> str:
    """Truncate a string to max_len characters."""
    if len(text) <= max_len:
        return text
    return text[:max_len - len(suffix)].rstrip() + suffix


def mask_email(email: str) -> str:
    """Mask an email for safe display: john.doe@example.com -> j***e@example.com"""
    try:
        local, domain = email.split('@', 1)
        if len(local) <= 2:
            return f'{local[0]}***@{domain}'
        return f'{local[0]}***{local[-1]}@{domain}'
    except ValueError:
        return '***'


def generate_token(length: int = 32) -> str:
    """Generate a cryptographically secure URL-safe token."""
    return secrets.token_urlsafe(length)


def sha256(text: str) -> str:
    """Return the SHA-256 hex digest of a string."""
    return hashlib.sha256(text.encode()).hexdigest()


def sanitise_query(query: str, max_len: int = 500) -> str:
    """Strip control characters and truncate chatbot input."""
    query = re.sub(r'[\x00-\x1f\x7f]', ' ', query)
    query = re.sub(r'\s+', ' ', query).strip()
    return query[:max_len]
