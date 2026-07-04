from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import UserResponse
from app.repositories.user_repo import UserRepository
from fastapi import HTTPException, status

router = APIRouter()


def require_role(allowed: list[UserRole]):
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted"
            )
        return current_user
    return checker


@router.get("/candidates", response_model=list[UserResponse])
async def search_candidates(
    # Optional query param: /api/v1/users/candidates?search=john
    search: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role([UserRole.recruiter, UserRole.admin])
    ),
):
    """
    Search all candidates.
    Recruiters and admins can access this.
    Optional ?search= filters by name or email.
    """
    repo = UserRepository(db)
    return await repo.get_all_candidates(search=search)


@router.get("/candidates/{user_id}", response_model=UserResponse)
async def get_candidate(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role([UserRole.recruiter, UserRole.admin])
    ),
):
    """Get a single candidate profile by ID."""
    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user or user.role != UserRole.candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return user


@router.get("/", response_model=list[UserResponse])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin only — get all users across all roles."""
    repo = UserRepository(db)
    return await repo.get_all_users()


@router.patch("/{user_id}/activate", response_model=UserResponse)
async def activate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin only — activate a deactivated user."""
    repo = UserRepository(db)
    user = await repo.set_active(user_id, True)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/deactivate", response_model=UserResponse)
async def deactivate_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin only — deactivate a user account."""
    repo = UserRepository(db)
    user = await repo.set_active(user_id, False)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user