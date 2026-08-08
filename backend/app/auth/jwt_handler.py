
import secrets
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.core.config import settings

def create_access_token(user_id: str, role: str) -> str:
    """
    Short lived JWT — 15 minutes.
    Contains user identity and role.
    Sent in Authorization header on every request.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "type": "access",  # explicitly mark token type
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token() -> str:
    """
    Long lived random token — 7 days.
    NOT a JWT — just a secure random string.
    Stored hashed in DB, sent in httpOnly cookie.
    
    Why not a JWT for refresh?
    JWTs are stateless — we can't revoke them without a blacklist.
    A random token stored in DB can be deleted = instant revocation.
    """
    return secrets.token_urlsafe(64)  # 64 bytes = 512 bits of randomness


def decode_access_token(token: str) -> dict:
    """
    Verify and decode an access token.
    Raises JWTError if invalid, expired, or wrong type.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        # Reject refresh tokens being used as access tokens
        if payload.get("type") != "access":
            raise JWTError("Invalid token type")
        return payload
    except JWTError:
        raise