from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from app.core.config import settings

def create_access_token(user_id: str, role: str) -> str:
    """
    Create a signed JWT token containing user_id and role.
    Expires after ACCESS_TOKEN_EXPIRE_MINUTES minutes.
    """
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire,         
        "iat": datetime.now(timezone.utc), 
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token


def decode_access_token(token: str) -> dict:
    """
    Verify and decode a JWT token.
    Raises JWTError if token is invalid or expired.
    Returns the payload dict if valid.
    """
    try:
        payload = jwt.decode(
            token, 
            settings.SECRET_KEY, 
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise  JWTError("Invalid or expired token")