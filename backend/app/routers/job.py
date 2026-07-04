from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.job import ApplicationStatus
from app.schemas.job import ApplicationWithCandidate, JobCreate, JobResponse, JobListResponse, ApplicationResponse
from app.services.job_service import JobService

router = APIRouter() 


def require_role(allowed: list[UserRole]):
    """Reusable role check dependency."""
    def checker(current_user: User = Depends(get_current_user)):
        if current_user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access restricted to: {[r.value for r in allowed]}"
            )
        return current_user
    return checker


# ── Static paths first (no path parameters) ─────────────────────────────────

@router.get("", response_model=list[JobListResponse])
@router.get("/", response_model=list[JobListResponse])
async def browse_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """All active jobs — any authenticated user can see."""
    service = JobService(db)
    return await service.browse_jobs()


@router.post("", response_model=JobResponse, status_code=201)
@router.post("/", response_model=JobResponse, status_code=201)
async def create_job(
    data: JobCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """Recruiter creates a new job posting."""
    service = JobService(db)
    return await service.create_job(current_user.id, data)


@router.get("/my-jobs", response_model=list[JobListResponse])
async def my_jobs(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """Recruiter views their own job postings."""
    service = JobService(db)
    return await service.get_my_jobs(current_user.id)


@router.get("/my-applications", response_model=list[ApplicationResponse])
async def my_applications(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.candidate])),
):
    """Candidate views their own applications."""
    service = JobService(db)
    return await service.my_applications(current_user.id)


# ── Dynamic {job_id} paths after ────────────────────────────────────────────
# These use path parameters, so they must come AFTER all static GET/POST routes
# above, otherwise /my-jobs or /my-applications could be swallowed as {job_id}
# if FastAPI ever changes its matching strategy (defense-in-depth).

@router.post("/{job_id}/apply", response_model=ApplicationResponse, status_code=201)
async def apply_to_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.candidate])),
):
    """Candidate applies to a job."""
    service = JobService(db)
    return await service.apply_to_job(current_user.id, job_id)


# @router.get("/{job_id}/applications", response_model=list[ApplicationResponse])
# async def job_applications(
#     job_id: str,
#     db: AsyncSession = Depends(get_db),
#     current_user: User = Depends(require_role([UserRole.recruiter])),
# ):
#     """Recruiter views all applications for their job."""
#     service = JobService(db)
#     return await service.get_job_applications(current_user.id, job_id)

@router.get("/{job_id}/applications", response_model=list[ApplicationWithCandidate])
async def job_applications(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """Recruiter views all applications for their job."""
    service = JobService(db)
    return await service.get_job_applications(current_user.id, job_id)


@router.patch("/applications/{application_id}/status", response_model=ApplicationResponse)
async def update_status(
    application_id: str,
    new_status: ApplicationStatus,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """Recruiter updates application status."""
    service = JobService(db)
    return await service.update_application_status(
        current_user.id, application_id, new_status
    )


@router.delete("/{job_id}", status_code=204)
async def close_job(
    job_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """Recruiter closes/deactivates a job."""
    service = JobService(db)
    await service.close_job(current_user.id, job_id)