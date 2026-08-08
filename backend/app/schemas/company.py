from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None


class CompanyResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    recruiter_id: str
    created_at: datetime

    model_config = {"from_attributes": True}