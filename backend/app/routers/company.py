from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.dependencies import get_db
from app.core.security import get_current_user
from app.models.user import User, UserRole
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse

router = APIRouter()


def require_recruiter(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.recruiter:
        raise HTTPException(status_code=403, detail="Recruiters only")
    return current_user


@router.get("", response_model=CompanyResponse | None)
async def get_my_company(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Get recruiter's registered company. Returns null if not registered."""
    result = await db.execute(
        select(Company).where(Company.recruiter_id == current_user.id)
    )
    return result.scalar_one_or_none()


@router.post("", response_model=CompanyResponse, status_code=201)
async def register_company(
    data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Register a company. One recruiter = one company."""
    # Check already registered
    result = await db.execute(
        select(Company).where(Company.recruiter_id == current_user.id)
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You have already registered a company"
        )
    company = Company(recruiter_id=current_user.id, **data.model_dump())
    db.add(company)
    await db.flush()
    await db.refresh(company)
    return company


@router.put("", response_model=CompanyResponse)
async def update_company(
    data: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_recruiter),
):
    """Update existing company details."""
    result = await db.execute(
        select(Company).where(Company.recruiter_id == current_user.id)
    )
    company = result.scalar_one_or_none()
    if not company:
        raise HTTPException(status_code=404, detail="No company registered yet")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(company, field, value)

    await db.flush()
    await db.refresh(company)
    return company