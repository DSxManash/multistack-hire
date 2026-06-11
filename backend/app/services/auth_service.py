

from datetime import datetime, timedelta
from fastapi import HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.repositories.refresh_token_repo import RefreshTokenRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshResponse, UserResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token, create_refresh_token
from app.core.config import settings
import uuid

# Name of the cookie the refresh token lives in
REFRESH_COOKIE_NAME = "refresh_token"

def set_refresh_cookie(response: Response, raw_token: str) -> None:
    """
    Set refresh token as httpOnly cookie on the response.

    httpOnly=True  → JavaScript cannot read this cookie at all
    secure=True    → Only sent over HTTPS (set False for local dev)
    samesite=lax   → Sent on same-site requests + top-level navigation
                     Blocks CSRF from third-party sites
    max_age        → Browser auto-deletes after 7 days
    path=/api/v1/auth → Cookie only sent to auth endpoints, not every request
    """
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_token,
        httponly=True,
        secure=settings.APP_ENV == "production",  # True in prod, False in dev
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",
    )

def clear_refresh_cookie(response: Response) -> None:
    """Remove the refresh cookie on logout."""
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
    )

class AuthService:

    def __init__(self, db: AsyncSession):
        self.user_repo = UserRepository(db)
        self.token_repo = RefreshTokenRepository(db)

    async def register(self, data: RegisterRequest, response: Response) -> TokenResponse:
        if await self.user_repo.email_exists(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        hashed = hash_password(data.password)
        user = await self.user_repo.create({
            "id": str(uuid.uuid4()),
            "full_name": data.full_name,
            "email": data.email,
            "password_hash": hashed,
            "role": data.role,
        })

        # Create both tokens
        access_token = create_access_token(user.id, user.role.value)
        raw_refresh = create_refresh_token()

        # Store hashed refresh token in DB
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, raw_refresh, expires_at)

        # Set refresh token as httpOnly cookie
        set_refresh_cookie(response, raw_refresh)

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user)
        )

    async def login(self, data: LoginRequest, response: Response) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.email)

        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled"
            )

        access_token = create_access_token(user.id, user.role.value)
        raw_refresh = create_refresh_token()

        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, raw_refresh, expires_at)

        set_refresh_cookie(response, raw_refresh)

        return TokenResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user)
        )

    async def refresh(self, raw_refresh_token: str, response: Response) -> RefreshResponse:
        """
        Token rotation flow:
        1. Find the old refresh token in DB
        2. Revoke it immediately (even before validating fully)
        3. Issue new access token + new refresh token
        4. Store new refresh token in DB
        5. Set new cookie

        Why revoke before issuing new one?
        If attacker steals a refresh token and uses it first,
        the legitimate user's next refresh will fail (token already revoked)
        alerting us to suspicious activity.
        """
        # Find valid token in DB
        token_record = await self.token_repo.get_valid_token(raw_refresh_token)

        if not token_record:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )

        # Get the user
        user = await self.user_repo.get_by_id(token_record.user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )

        # Revoke old token (rotation)
        await self.token_repo.revoke(raw_refresh_token)

        # Issue new tokens
        new_access = create_access_token(user.id, user.role.value)
        new_refresh = create_refresh_token()

        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        await self.token_repo.create(user.id, new_refresh, expires_at)

        set_refresh_cookie(response, new_refresh)

        return RefreshResponse(access_token=new_access)

    async def logout(self, raw_refresh_token: str | None, response: Response) -> None:
        """Revoke refresh token and clear cookie."""
        if raw_refresh_token:
            await self.token_repo.revoke(raw_refresh_token)
        clear_refresh_cookie(response)