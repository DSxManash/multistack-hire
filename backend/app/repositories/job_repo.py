from datetime import datetime, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

from app.models.job import Job, Application, ApplicationStatus


class JobRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_job(self, recruiter_id: str, data: dict) -> Job:
        payload = dict(data)
        if payload.get("application_deadline") is None:
            payload["application_deadline"] = datetime.utcnow() + timedelta(days=30)

        job = Job(recruiter_id=recruiter_id, **payload)
        self.db.add(job)
        await self.db.flush()
        await self.db.refresh(job)
        return job

    async def get_all_active(self) -> list[Job]:
        """Return all active jobs visible to candidates."""
        result = await self.db.execute(
            select(Job)
            .where(Job.is_active == True)
            .order_by(Job.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_recruiter(self, recruiter_id: str) -> list[Job]:
        """Return active jobs posted by a recruiter (soft-deleted jobs excluded)."""
        result = await self.db.execute(
            select(Job)
            .where(
                Job.recruiter_id == recruiter_id,
                Job.is_active == True,
            )
            .order_by(Job.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(self, job_id: str) -> Job | None:
        """Return a job by its ID."""
        result = await self.db.execute(
            select(Job).where(Job.id == job_id)
        )
        return result.scalar_one_or_none()

    async def deactivate(self, job_id: str) -> None:
        """Deactivate a job."""
        job = await self.get_by_id(job_id)
        if job:
            job.is_active = False
            await self.db.flush()


class ApplicationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def already_applied(
        self,
        candidate_id: str,
        job_id: str,
    ) -> bool:
        """Check if a candidate has already applied for a job."""
        result = await self.db.execute(
            select(Application).where(
                Application.candidate_id == candidate_id,
                Application.job_id == job_id,
            )
        )
        return result.scalar_one_or_none() is not None

    async def apply(
        self,
        candidate_id: str,
        job_id: str,
    ) -> Application:
        """Create a new application."""
        application = Application(
            candidate_id=candidate_id,
            job_id=job_id,
        )
        self.db.add(application)
        await self.db.flush()
        await self.db.refresh(application)
        return application

    async def get_candidate_applications(
        self,
        candidate_id: str,
    ) -> list[Application]:
        """Return all applications submitted by a candidate."""
        result = await self.db.execute(
            select(Application)
            .where(Application.candidate_id == candidate_id)
            .order_by(Application.applied_at.desc())
        )
        return list(result.scalars().all())

    async def get_job_applications(
        self,
        job_id: str,
    ) -> list[Application]:
        """Return all applications for a job."""
        result = await self.db.execute(
            select(Application)
            .options(
                selectinload(Application.candidate)
            )
            .where(Application.job_id == job_id)
            .order_by(Application.applied_at.desc())
        )
        return list(result.scalars().all())

    async def update_status(
        self,
        application_id: str,
        status: ApplicationStatus,
    ) -> Application | None:
        """Update an application's status."""
        result = await self.db.execute(
            select(Application).where(
                Application.id == application_id
            )
        )
        application = result.scalar_one_or_none()

        if application:
            application.status = status
            await self.db.flush()

        return application

    async def count_by_candidate(
        self,
        candidate_id: str,
    ) -> int:
        """Count total applications submitted by a candidate."""
        result = await self.db.execute(
            select(func.count()).where(
                Application.candidate_id == candidate_id
            )
        )
        return result.scalar() or 0

    async def get_shortlisted_by_recruiter(
        self,
        recruiter_id: str,
    ) -> list[Application]:
        """
        Return all shortlisted applications across all jobs
        posted by the given recruiter.
        """
        result = await self.db.execute(
            select(Application)
            .join(Job, Application.job_id == Job.id)
            .options(
                selectinload(Application.candidate),
                selectinload(Application.job),
            )
            .where(
                Job.recruiter_id == recruiter_id,
                Application.status == ApplicationStatus.shortlisted,
            )
            .order_by(Application.applied_at.desc())
        )

        return list(result.scalars().all())