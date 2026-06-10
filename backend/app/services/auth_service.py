# backend/app/services/auth_service.py

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repo import UserRepository
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.auth.password import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
import uuid

class AuthService:

    def __init__(self, db: AsyncSession):
        self.repo = UserRepository(db)

    async def register(self, data: RegisterRequest) -> TokenResponse:
        # 1. Check if email already exists
        if await self.repo.email_exists(data.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )

        # 2. Hash the password before storing it
        hashed = hash_password(data.password)

        # 3. Create user in database with hashed password
        user = await self.repo.create({
            "id": str(uuid.uuid4()),
            "full_name": data.full_name,
            "email": data.email,
            "password_hash": hashed,
            "role": data.role,
        })

        # 4. Generate JWT token immediately after registration ,User is logged in right after registering.
    
        token = create_access_token(user.id, user.role.value)

        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user)
        )

    async def login(self, data: LoginRequest) -> TokenResponse:
        # 1. Find user by email
        user = await self.repo.get_by_email(data.email)

        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )

        # 3. Check account is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is disabled"
            )

        # 4. Generate and return token
        token = create_access_token(user.id, user.role.value)

        return TokenResponse(
            access_token=token,
            user=UserResponse.model_validate(user)
        )