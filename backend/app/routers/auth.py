
from fastapi import APIRouter, Depends, Cookie
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.responses import Response
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse, RefreshResponse, UserResponse
from app.services.auth_service import AuthService, REFRESH_COOKIE_NAME
from app.models.user import User

router = APIRouter()

@router.post("/register", response_model=TokenResponse, status_code=201)
async def register(
    data: RegisterRequest,
    response: Response,           # FastAPI injects this so we can set cookies
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.register(data, response)


@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    return await service.login(data, response)


@router.post("/refresh", response_model=RefreshResponse)
async def refresh(
    response: Response,
    # FastAPI reads the cookie automatically by name
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db)
):
    """
    Called automatically by the frontend when access token expires.
    Reads refresh token from httpOnly cookie — frontend JS never touches it.
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token provided"
        )
    service = AuthService(db)
    return await service.refresh(refresh_token, response)


@router.post("/logout")
async def logout(
    response: Response,
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db)
):
    service = AuthService(db)
    await service.logout(refresh_token, response)
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user