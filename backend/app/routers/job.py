from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.job import ApplicationStatus
from app.schemas.job import ApplicationWithCandidate, JobCreate, JobResponse, JobListResponse, ApplicationResponse
from app.services.job_service import JobService
from app.schemas.job import ShortlistedApplication

from sqlalchemy import select, func, case

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
@router.get("/analytics", response_model=dict)
async def get_analytics(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """
    Returns all analytics data for the recruiter in one call.
    Avoids N+1 queries by using SQL aggregates.
    """
    from app.models.job import Job, Application, ApplicationStatus

    # Total jobs posted by this recruiter
    total_jobs_result = await db.execute(
        select(func.count()).where(Job.recruiter_id == current_user.id)
    )
    total_jobs = total_jobs_result.scalar() or 0

    # Active vs closed jobs
    active_jobs_result = await db.execute(
        select(func.count()).where(
            Job.recruiter_id == current_user.id,
            Job.is_active == True
        )
    )
    active_jobs = active_jobs_result.scalar() or 0

    # Total applications across all recruiter's jobs
    total_apps_result = await db.execute(
        select(func.count())
        .select_from(Application)
        .join(Job, Application.job_id == Job.id)
        .where(Job.recruiter_id == current_user.id)
    )
    total_applications = total_apps_result.scalar() or 0

    # Applications by status
    status_result = await db.execute(
        select(Application.status, func.count().label("count"))
        .join(Job, Application.job_id == Job.id)
        .where(Job.recruiter_id == current_user.id)
        .group_by(Application.status)
    )
    status_rows = status_result.all()
    status_breakdown = {row.status.value: row.count for row in status_rows}

    # Applications per job (for bar chart)
    apps_per_job_result = await db.execute(
        select(Job.title, func.count(Application.id).label("count"))
        .outerjoin(Application, Application.job_id == Job.id)
        .where(Job.recruiter_id == current_user.id)
        .group_by(Job.id, Job.title)
        .order_by(func.count(Application.id).desc())
        .limit(10)
    )
    apps_per_job = [
        {"job": row.title, "applications": row.count}
        for row in apps_per_job_result.all()
    ]

    # Shortlist rate
    shortlisted = status_breakdown.get("shortlisted", 0)
    shortlist_rate = round(
        (shortlisted / total_applications * 100) if total_applications > 0 else 0, 1
    )

    # Rejection rate
    rejected = status_breakdown.get("rejected", 0)
    rejection_rate = round(
        (rejected / total_applications * 100) if total_applications > 0 else 0, 1
    )

    return {
        "total_jobs": total_jobs,
        "active_jobs": active_jobs,
        "closed_jobs": total_jobs - active_jobs,
        "total_applications": total_applications,
        "shortlist_rate": shortlist_rate,
        "rejection_rate": rejection_rate,
        "status_breakdown": {
            "applied": status_breakdown.get("applied", 0),
            "reviewed": status_breakdown.get("reviewed", 0),
            "shortlisted": status_breakdown.get("shortlisted", 0),
            "rejected": status_breakdown.get("rejected", 0),
        },
        "apps_per_job": apps_per_job,
    }


 # recruiter stats endpoint 
@router.get("/dashboard-stats")
async def get_recruiter_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """Quick stats for recruiter dashboard cards."""
    from sqlalchemy import func
    from app.models.job import Job, Application, ApplicationStatus
    from app.models.user import UserRole as UR

    # Total candidates in system
    candidates_result = await db.execute(
        select(func.count()).where(User.role == UR.candidate)
    )
    total_candidates = candidates_result.scalar() or 0

    # Shortlisted by this recruiter
    shortlisted_result = await db.execute(
        select(func.count())
        .select_from(Application)
        .join(Job, Application.job_id == Job.id)
        .where(
            Job.recruiter_id == current_user.id,
            Application.status == ApplicationStatus.shortlisted,
        )
    )
    shortlisted = shortlisted_result.scalar() or 0

    # Avg ranking score of shortlisted candidates
    from sqlalchemy import func as sqlfunc
    from app.models.user import User as UserModel
    avg_result = await db.execute(
        select(sqlfunc.avg(UserModel.ranking_score))
        .select_from(Application)
        .join(Job, Application.job_id == Job.id)
        .join(UserModel, Application.candidate_id == UserModel.id)
        .where(
            Job.recruiter_id == current_user.id,
            Application.status == ApplicationStatus.shortlisted,
            UserModel.ranking_score.isnot(None),
        )
    )
    avg_score = avg_result.scalar()

    return {
        "total_candidates": total_candidates,
        "shortlisted": shortlisted,
        "avg_score": round(avg_score, 1) if avg_score else None,
    }


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


@router.get("/shortlisted", response_model=list[ShortlistedApplication])
async def get_shortlisted(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.recruiter])),
):
    """All shortlisted candidates across recruiter's jobs."""
    service = JobService(db)
    return await service.get_shortlisted(current_user.id)



