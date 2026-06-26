
from pydantic import BaseModel
from datetime import datetime
from app.models.job import JobType, ApplicationStatus


#  Job Schemas

class JobCreate(BaseModel):
    title: str
    description: str
    requirements: str
    location: str
    job_type: JobType = JobType.full_time
    company_name: str


class JobResponse(BaseModel):
    id: str
    title: str
    description: str
    requirements: str
    location: str
    job_type: JobType
    company_name: str
    recruiter_id: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    id: str
    title: str
    location: str
    job_type: JobType
    company_name: str
    is_active: bool
    created_at: datetime

    # How many applied — computed field
    application_count: int = 0

    model_config = {"from_attributes": True}


#  Application Schemas 

class ApplicationResponse(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    status: ApplicationStatus
    applied_at: datetime

    model_config = {"from_attributes": True}


class ApplicationWithJob(BaseModel):
    id: str
    status: ApplicationStatus
    applied_at: datetime
    job: JobListResponse

    model_config = {"from_attributes": True}