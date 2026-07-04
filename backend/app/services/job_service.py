from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.job_repo import JobRepository, ApplicationRepository
from app.schemas.job import JobCreate, JobResponse, JobListResponse, ApplicationResponse
from app.models.job import Application, ApplicationStatus


class JobService:

    def __init__(self, db: AsyncSession):
        self.job_repo = JobRepository(db)
        self.app_repo = ApplicationRepository(db)

    # ── Recruiter actions ─────────────────────────────────────────

    async def create_job(self, recruiter_id: str, data: JobCreate) -> JobResponse:
        job = await self.job_repo.create_job(
            recruiter_id=recruiter_id,
            data=data.model_dump()
        )
        return JobResponse.model_validate(job)

    async def get_my_jobs(self, recruiter_id: str) -> list[JobListResponse]:
        jobs = await self.job_repo.get_by_recruiter(recruiter_id)
        result = []
        for job in jobs:
            apps = await self.app_repo.get_job_applications(job.id)
            item = JobListResponse.model_validate(job)
            item.application_count = len(apps)
            result.append(item)
        return result

    async def close_job(self, recruiter_id: str, job_id: str) -> None:
        job = await self.job_repo.get_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.recruiter_id != recruiter_id:
            raise HTTPException(status_code=403, detail="Not your job")
        await self.job_repo.deactivate(job_id)

    # ── Candidate actions ─────────────────

    async def browse_jobs(self) -> list[JobListResponse]:
        jobs = await self.job_repo.get_all_active()
        return [JobListResponse.model_validate(j) for j in jobs]

    async def apply_to_job(
        self, candidate_id: str, job_id: str
    ) -> ApplicationResponse:
        job = await self.job_repo.get_by_id(job_id)
        if not job or not job.is_active:
            raise HTTPException(
                status_code=404,
                detail="Job not found or no longer active"
            )
        if await self.app_repo.already_applied(candidate_id, job_id):
            raise HTTPException(
                status_code=409,
                detail="You have already applied to this job"
            )
        app = await self.app_repo.apply(candidate_id, job_id)
        return ApplicationResponse.model_validate(app)

    async def my_applications(self, candidate_id: str) -> list[ApplicationResponse]:
        apps = await self.app_repo.get_candidate_applications(candidate_id)
        return [ApplicationResponse.model_validate(a) for a in apps]

    # ── Recruiter reviewing applications ──────────────────────────

    async def get_job_applications(
        self, recruiter_id: str, job_id: str
    ) -> list[Application]:
        job = await self.job_repo.get_by_id(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        if job.recruiter_id != recruiter_id:
            raise HTTPException(status_code=403, detail="Not your job")
        return await self.app_repo.get_job_applications(job_id)

    async def update_application_status(
        self, recruiter_id: str, application_id: str, new_status: ApplicationStatus
    ) -> ApplicationResponse:
        app = await self.app_repo.update_status(application_id, new_status)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        return ApplicationResponse.model_validate(app)
    

    async def get_shortlisted(self, recruiter_id: str) -> list[Application]:
    # All shortlisted candidates across all recruiter's jobs.
        return await self.app_repo.get_shortlisted_by_recruiter(recruiter_id)