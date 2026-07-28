from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import UserResponse, UpdateUserRoleRequest
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
    search: str | None = Query(default=None),
    role: UserRole | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin only — get all users across all roles."""
    repo = UserRepository(db)
    return await repo.get_all_users(search=search, role=role)


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
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account",
        )

    repo = UserRepository(db)
    user = await repo.set_active(user_id, False)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: str,
    body: UpdateUserRoleRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin only — change a user's role."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change your own role",
        )

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == UserRole.admin and body.role != UserRole.admin:
        admin_count = await repo.count_by_role(UserRole.admin)
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot demote the last admin account",
            )

    updated = await repo.update_role(user_id, body.role)
    return updated


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """Admin only — permanently delete a user account."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.role == UserRole.admin:
        admin_count = await repo.count_by_role(UserRole.admin)
        if admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete the last admin account",
            )

    await repo.delete(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Admin dashboard stats endpoint 
@router.get("/stats")
async def get_admin_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.admin])),
):
    """System-wide stats for admin dashboard."""
    from sqlalchemy import func, select
    from app.models.user import User, UserRole

    # Total users by role
    total_result = await db.execute(select(func.count()).select_from(User))
    total = total_result.scalar() or 0

    candidates_result = await db.execute(
        select(func.count()).where(User.role == UserRole.candidate)
    )
    candidates = candidates_result.scalar() or 0

    recruiters_result = await db.execute(
        select(func.count()).where(User.role == UserRole.recruiter)
    )
    recruiters = recruiters_result.scalar() or 0

    ranked_result = await db.execute(
        select(func.count()).where(User.ranking_score.isnot(None))
    )
    ranked = ranked_result.scalar() or 0

    return {
        "total_users": total,
        "total_candidates": candidates,
        "total_recruiters": recruiters,
        "rankings_generated": ranked,
    }