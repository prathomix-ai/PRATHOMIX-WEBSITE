"""
Redis cache client stub.
Install: pip install redis[asyncio]
Set: REDIS_URL=redis://localhost:6379/0 in .env

Falls back gracefully if Redis is not configured —
all cache operations become no-ops so the app works without Redis.

Usage:
  from cache.redis_client import cache_get, cache_set, cache_delete

  result = await cache_get("chatbot:groq:intent:hello")
  if result is None:
      result = await expensive_groq_call()
      await cache_set("chatbot:groq:intent:hello", result, ttl=300)
"""
import os
import json
from utils.logger import get_logger

log = get_logger("cache")

REDIS_URL = os.getenv("REDIS_URL", "")
_client   = None


async def _get_client():
    global _client
    if _client is not None:
        return _client
    if not REDIS_URL:
        return None
    try:
        import redis.asyncio as redis
        _client = redis.from_url(REDIS_URL, decode_responses=True)
        await _client.ping()
        log.info("Redis connected.")
        return _client
    except Exception as e:
        log.warning(f"Redis unavailable ({e}) — caching disabled.")
        return None


async def cache_get(key: str) -> dict | str | None:
    """Get a cached value. Returns None on miss or if Redis is down."""
    client = await _get_client()
    if not client:
        return None
    try:
        raw = await client.get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return raw
    except Exception as e:
        log.warning(f"cache_get({key}) error: {e}")
        return None


async def cache_set(key: str, value: dict | str, ttl: int = 300) -> bool:
    """Set a cached value with TTL in seconds. Returns True on success."""
    client = await _get_client()
    if not client:
        return False
    try:
        serialised = json.dumps(value) if isinstance(value, dict) else value
        await client.setex(key, ttl, serialised)
        return True
    except Exception as e:
        log.warning(f"cache_set({key}) error: {e}")
        return False


async def cache_delete(key: str) -> bool:
    """Delete a cached key."""
    client = await _get_client()
    if not client:
        return False
    try:
        await client.delete(key)
        return True
    except Exception as e:
        log.warning(f"cache_delete({key}) error: {e}")
        return False


async def cache_flush_prefix(prefix: str) -> int:
    """Delete all keys matching a prefix. Returns count deleted."""
    client = await _get_client()
    if not client:
        return 0
    try:
        keys = await client.keys(f"{prefix}*")
        if keys:
            return await client.delete(*keys)
        return 0
    except Exception as e:
        log.warning(f"cache_flush_prefix({prefix}) error: {e}")
        return 0
