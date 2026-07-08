
import json
from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User
from app.schemas.candidate import ProfileUpdate, ProfileResponse, ProfileCompletionResponse
from app.utils.minio_client import upload_resume, get_resume_url


class CandidateService:

    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_profile(self, user: User) -> ProfileResponse:
        """Return profile with skills parsed from JSON."""
        data = ProfileResponse.model_validate(user)
        data.skills = user.get_skills()
        # Generate fresh presigned URL if resume exists
        if user.resume_url:
            try:
                data.resume_url = await get_resume_url(user.resume_url)
            except Exception:
                data.resume_url = None
        return data

    async def update_profile(
        self, user: User, data: ProfileUpdate
    ) -> ProfileResponse:
        """Update profile fields. Auto-sets profile_completed."""

        # Update only provided fields
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
            user.github_username = data.github_username.strip().lstrip('@')
        if data.stackoverflow_username is not None:
            user.stackoverflow_username = data.stackoverflow_username.strip()
        if data.linkedin_url is not None:
            user.linkedin_url = data.linkedin_url

        # Auto-check profile completion
        user.profile_completed = user.check_profile_completed()
        user.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(user)

        return await self.get_profile(user)

    async def upload_resume_file(
        self, user: User, file_bytes: bytes, filename: str
    ) -> ProfileResponse:
        """Upload PDF to MinIO, store object path in user profile."""

        # Validate file size — max 5MB
        max_size = 5 * 1024 * 1024
        if len(file_bytes) > max_size:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File too large. Maximum size is 5MB"
            )

        # Validate file type
        if not filename.lower().endswith('.pdf'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF files are accepted"
            )

        # Upload to MinIO — returns object name (path in bucket)
        object_name = await upload_resume(
            file_bytes=file_bytes,
            filename=filename,
            content_type="application/pdf"
        )

        # Store object name in DB (not the full URL — URLs expire,
        # object names don't. We generate fresh URLs on demand)
        user.resume_url = object_name
        user.resume_uploaded_at = datetime.utcnow()

        # Check if profile is now complete
        user.profile_completed = user.check_profile_completed()
        user.updated_at = datetime.utcnow()

        await self.db.flush()
        await self.db.refresh(user)

        return await self.get_profile(user)

    def get_completion(self, user: User) -> ProfileCompletionResponse:
        """Calculate profile completion percentage and list missing fields."""
        fields = {
            'GitHub username': user.github_username,
            'StackOverflow username': user.stackoverflow_username,
            'Resume/CV': user.resume_url,
            'Phone number': user.phone_number,
            'Location': user.location,
            'Bio': user.bio,
            'Years of experience': user.years_of_experience,
            'Skills': user.get_skills(),
        }

        total = len(fields)
        completed_count = sum(1 for v in fields.values() if v)
        missing = [k for k, v in fields.items() if not v]
        percentage = int((completed_count / total) * 100)

        return ProfileCompletionResponse(
            percentage=percentage,
            missing=missing,
            completed=user.profile_completed,
        )