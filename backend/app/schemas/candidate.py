
from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime


class ProfileUpdate(BaseModel):
    phone_number: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: Optional[list[str]] = None
    github_username: Optional[str] = None
    stackoverflow_username: Optional[str] = None
    linkedin_url: Optional[str] = None


class ProfileResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    skills: list[str] = []
    github_username: Optional[str] = None
    stackoverflow_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    resume_url: Optional[str] = None
    resume_uploaded_at: Optional[datetime] = None
    ranking_score: Optional[float] = None
    profile_completed: bool = False

    model_config = {"from_attributes": True}


class ProfileCompletionResponse(BaseModel):
    percentage: int
    missing: list[str]
    completed: bool