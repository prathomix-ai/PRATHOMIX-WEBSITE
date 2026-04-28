"""
In-memory sliding-window rate limiter.
For production swap with slowapi + Redis.

Usage:
  limiter = RateLimiter(max_calls=20, period_seconds=60)

  @router.post("/chat")
  async def chat(request: Request, _=Depends(limiter)):
      ...
"""
import time
from collections import defaultdict, deque
from fastapi import Request, HTTPException, status


class RateLimiter:
    def __init__(self, max_calls: int = 30, period_seconds: int = 60):
        self.max_calls = max_calls
        self.period    = period_seconds
        self._store: dict[str, deque] = defaultdict(deque)

    def _key(self, request: Request) -> str:
        fwd = request.headers.get("x-forwarded-for")
        if fwd:
            return fwd.split(",")[0].strip()
        return request.client.host if request.client else "unknown"

    async def __call__(self, request: Request):
        key  = self._key(request)
        now  = time.monotonic()
        win  = now - self.period
        q    = self._store[key]
        while q and q[0] < win:
            q.popleft()
        if len(q) >= self.max_calls:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Rate limit exceeded. Max {self.max_calls} req/{self.period}s.",
                headers={"Retry-After": str(self.period)},
            )
        q.append(now)
