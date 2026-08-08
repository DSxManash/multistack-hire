
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.auth.jwt_handler import decode_access_token
from app.repositories.user_repo import UserRepository
from app.models.user import User

# HTTPBearer reads the "Authorization: Bearer <token>" header automatically
bearer_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency for protected routes.
    Verifies JWT and returns the current user object.

    Usage in any router:
        @router.get("/me")
        async def my_route(current_user: User = Depends(get_current_user)):
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(credentials.credentials)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

  # Fetch the user from the database to ensure they still exist and are active
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)

    if user is None or not user.is_active:
        raise credentials_exception

    return user