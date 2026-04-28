"""
JWT auth middleware — validates Supabase-issued tokens.

Usage:
  from middleware.auth import require_auth, require_admin

  @router.get("/protected")
  async def route(user: dict = Depends(require_auth)):
      ...
"""
import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

_security   = HTTPBearer(auto_error=False)
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "founder.prathomix@gmail.com")
JWT_SECRET  = os.getenv("SUPABASE_JWT_SECRET", "")


def _decode(token: str) -> dict:
    if not JWT_SECRET:
        raise HTTPException(status_code=503, detail="SUPABASE_JWT_SECRET not configured.")
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")


async def require_auth(
    creds: HTTPAuthorizationCredentials | None = Depends(_security),
) -> dict:
    if not creds:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return _decode(creds.credentials)


async def require_admin(user: dict = Depends(require_auth)) -> dict:
    if user.get("email") != ADMIN_EMAIL:
        raise HTTPException(status_code=403, detail="Admin access required.")
    return user
