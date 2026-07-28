
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.schemas.candidate import ProfileUpdate, ProfileResponse, ProfileCompletionResponse
from app.services.candidate_service import CandidateService
from fastapi import HTTPException, status

from app.schemas.candidate import (
    ProfileUpdate, ProfileResponse,
    ProfileCompletionResponse, ChangePasswordRequest
)

router = APIRouter()


def require_candidate(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.candidate:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidates only"
        )
    return current_user


@router.get("/profile", response_model=ProfileResponse)
async def get_profile(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Get current candidate's full profile."""
    service = CandidateService(db)
    return await service.get_profile(current_user)


@router.put("/profile", response_model=ProfileResponse)
async def update_profile(
    data: ProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Update candidate profile fields."""
    service = CandidateService(db)
    return await service.update_profile(current_user, data)


@router.post("/resume", response_model=ProfileResponse)
async def upload_resume(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """
    Upload PDF resume to MinIO.
    Automatically updates profile_completed if requirements met.
    """
    file_bytes = await file.read()
    service = CandidateService(db)
    return await service.upload_resume_file(
        user=current_user,
        file_bytes=file_bytes,
        filename=file.filename,
    )


@router.get("/profile/completion", response_model=ProfileCompletionResponse)
async def get_completion(
    current_user: User = Depends(require_candidate),
    db: AsyncSession = Depends(get_db),
):
    """Get profile completion percentage and missing fields."""
    service = CandidateService(db)
    return service.get_completion(current_user)

@router.post("/settings/change-password")
async def change_password(
    data: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_candidate),
):
    """Change candidate password after verifying current one."""
    service = CandidateService(db)
    return await service.change_password(current_user, data)