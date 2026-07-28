import json
from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.schemas.candidate import (
    ProfileUpdate,
    ProfileResponse,
    ProfileCompletionResponse,
    ChangePasswordRequest,
)
from app.utils.minio_client import upload_resume, get_resume_url


class CandidateService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user: User) -> ProfileResponse:
        skills_list = user.get_skills()
        data = ProfileResponse(
            id=user.id,
            full_name=user.full_name,
            email=user.email,
            phone_number=user.phone_number,
            location=user.location,
            bio=user.bio,
            years_of_experience=user.years_of_experience,
            skills=skills_list,
            github_username=user.github_username,
            stackoverflow_username=user.stackoverflow_username,
            linkedin_url=user.linkedin_url,
            resume_url=user.resume_url,
            resume_uploaded_at=user.resume_uploaded_at,
            ranking_score=user.ranking_score,
            profile_completed=user.profile_completed,
        )

        if user.resume_url:
            try:
                data.resume_url = await get_resume_url(user.resume_url)
            except Exception:
                data.resume_url = None

        return data

    async def update_profile(
        self, user: User, data: ProfileUpdate
    ) -> ProfileResponse:
        if data.phone_number is not None:
            user.phone_number = data.phone_number

        if data.location is not None:
            user.location = data.location

        if data.bio is not None:
            user.bio = data.bio

        if data.years_of_experience is not None:
            user.years_of_experience = data.years_of_experience

        if data.skills is not None:
            user.set_skills(data.skills)

        if data.github_username is not None:
            user.github_username = data.github_username.strip().lstrip("@")

        if data.stackoverflow_username is not None:
            user.stackoverflow_username = data.stackoverflow_username.strip()

        if data.linkedin_url is not None:
            user.linkedin_url = data.linkedin_url

        user.profile_completed = user.check_profile_completed()
        user.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(user)

        return await self.get_profile(user)

    async def upload_resume_file(
        self, user: User, file_bytes: bytes, filename: str
    ) -> ProfileResponse:
        max_size = 5 * 1024 * 1024  # 5 MB

        if len(file_bytes) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 5MB",
            )

        if not filename.lower().endswith(".pdf"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are accepted",
            )

        object_name = await upload_resume(
            file_bytes=file_bytes,
            filename=filename,
            content_type="application/pdf",
        )

        user.resume_url = object_name
        user.resume_uploaded_at = datetime.utcnow()
        user.profile_completed = user.check_profile_completed()
        user.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(user)

        return await self.get_profile(user)

    def get_completion(self, user: User) -> ProfileCompletionResponse:
        fields = {
            "GitHub username": user.github_username,
            "StackOverflow username": user.stackoverflow_username,
            "Resume/CV": user.resume_url,
            "Phone number": user.phone_number,
            "Location": user.location,
            "Bio": user.bio,
            "Years of experience": user.years_of_experience,
            "Skills": user.get_skills(),
        }

        total = len(fields)
        completed_count = sum(1 for value in fields.values() if value)
        missing = [key for key, value in fields.items() if not value]
        percentage = int((completed_count / total) * 100)

        return ProfileCompletionResponse(
            percentage=percentage,
            missing=missing,
            completed=user.profile_completed,
        )

    async def change_password(
        self, user: User, data: ChangePasswordRequest
    ) -> dict:
        from app.auth.password import verify_password, hash_password

        # Verify passwords match
        if data.new_password != data.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New passwords do not match",
            )

        # Verify current password is correct
        if not verify_password(data.current_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect",
            )

        # Prevent using the same password
        if data.current_password == data.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password",
            )

        # Hash and save the new password
        user.password_hash = hash_password(data.new_password)
        user.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(user)

        return {"message": "Password changed successfully"}