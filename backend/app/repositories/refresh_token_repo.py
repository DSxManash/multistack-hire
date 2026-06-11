
import hashlib
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.refresh_token import RefreshToken

class RefreshTokenRepository:

    def __init__(self, db: AsyncSession):
        self.db = db

    def _hash_token(self, raw_token: str) -> str:
        """
        Hash the raw token before storing.
        SHA-256 is fast and sufficient here —
        refresh tokens are already long random strings,
        unlike passwords which need slow hashing (bcrypt).
        """
        return hashlib.sha256(raw_token.encode()).hexdigest()

    async def create(self, user_id: str, raw_token: str, expires_at: datetime) -> RefreshToken:
        """Store a new refresh token (hashed)."""
        token = RefreshToken(
            user_id=user_id,
            token_hash=self._hash_token(raw_token),
            expires_at=expires_at,
        )
        self.db.add(token)
        await self.db.flush()
        return token

    async def get_valid_token(self, raw_token: str) -> RefreshToken | None:
        """
        Find a refresh token by its raw value.
        Returns None if not found, revoked, or expired.
        """
        token_hash = self._hash_token(raw_token)
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.token_hash == token_hash,
                RefreshToken.is_revoked == False,
                RefreshToken.expires_at > datetime.utcnow(),
            )
        )
        return result.scalar_one_or_none()

    async def revoke(self, raw_token: str) -> None:
        """Mark a token as revoked — used on logout and token rotation."""
        token_hash = self._hash_token(raw_token)
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        token = result.scalar_one_or_none()
        if token:
            token.is_revoked = True
            await self.db.flush()

    async def revoke_all_for_user(self, user_id: str) -> None:
        """
        Revoke ALL refresh tokens for a user.
        Used when suspicious activity is detected
        or user changes password.
        """
        await self.db.execute(
            delete(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.is_revoked == False,
            )
        )
        await self.db.flush()