from datetime import datetime, timedelta
from types import SimpleNamespace

import pytest

from app.schemas.job import JobCreate
from app.services.job_service import JobService


class DummyJobRepository:
    def __init__(self):
        self.calls = []

    async def create_job(self, recruiter_id, data):
        self.calls.append((recruiter_id, data))
        return SimpleNamespace(
            id="job-1",
            title=data["title"],
            description=data["description"],
            requirements=data["requirements"],
            location=data["location"],
            job_type=data["job_type"],
            company_name=data["company_name"],
            recruiter_id=recruiter_id,
            is_active=True,
            created_at=datetime.utcnow(),
            application_deadline=data["application_deadline"],
        )


@pytest.mark.asyncio
async def test_create_job_uses_default_deadline_when_none_is_sent():
    service = JobService(db=None)
    service.job_repo = DummyJobRepository()

    payload = JobCreate(
        title="Senior Backend Engineer",
        description="Build APIs",
        requirements="Python",
        location="Remote",
        company_name="Acme",
        application_deadline=None,
    )

    response = await service.create_job("recruiter-1", payload)

    assert response.application_deadline is not None
    assert response.application_deadline >= datetime.utcnow() + timedelta(days=29)
    assert response.application_deadline <= datetime.utcnow() + timedelta(days=31)
