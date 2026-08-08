
from pydantic import BaseModel, field_validator
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
    # THIS FIELD so the recruiter can send it from the frontend
    application_deadline: datetime | None = None 

    @field_validator("application_deadline", mode="before")
    @classmethod
    def empty_str_to_none(cls, v):
        if isinstance(v, str) and not v.strip():
            return None
        return v 

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

    application_deadline: datetime | None = None

    model_config = {"from_attributes": True}


class JobListResponse(BaseModel):
    id: str
    title: str
    description: str        
    requirements: str 
    location: str
    job_type: JobType
    company_name: str
    is_active: bool
    created_at: datetime

    application_deadline: datetime | None = None  # Include the application deadline in the list response

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

#  Candidate Schemas 
class CandidateInfo(BaseModel):
    id: str
    full_name: str
    email: str
    model_config = {"from_attributes": True}

class ApplicationWithCandidate(BaseModel):
    id: str
    job_id: str
    candidate_id: str
    status: ApplicationStatus
    applied_at: datetime
    candidate: CandidateInfo  # ← joined candidate info

    model_config = {"from_attributes": True}

class ShortlistedApplication(BaseModel):
    id: str
    status: ApplicationStatus
    applied_at: datetime
    candidate: CandidateInfo
    job: JobListResponse

    model_config = {"from_attributes": True}
