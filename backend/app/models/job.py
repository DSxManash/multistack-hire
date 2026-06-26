
import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Text, Enum as SAEnum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class JobType(str, enum.Enum):
    full_time = "full_time"
    part_time = "part_time"
    contract = "contract"
    internship = "internship"


class ApplicationStatus(str, enum.Enum):
    applied = "applied"
    reviewed = "reviewed"
    shortlisted = "shortlisted"
    rejected = "rejected"


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[str] = mapped_column(
        String, primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(100), nullable=False)
    job_type: Mapped[JobType] = mapped_column(
        SAEnum(JobType), nullable=False,
        default=JobType.full_time
    )
    company_name: Mapped[str] = mapped_column(String(200), nullable=False)

    # Which recruiter posted this job
    recruiter_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    recruiter: Mapped["User"] = relationship("User", back_populates="posted_jobs")
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="job",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Job {self.title} @ {self.company_name}>"


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(
        String, primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    job_id: Mapped[str] = mapped_column(
        String, ForeignKey("jobs.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    candidate_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False, index=True
    )
    status: Mapped[ApplicationStatus] = mapped_column(
        SAEnum(ApplicationStatus),
        nullable=False,
        default=ApplicationStatus.applied
    )
    applied_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="applications")
    candidate: Mapped["User"] = relationship("User", back_populates="applications")

    def __repr__(self):
        return f"<Application job={self.job_id} candidate={self.candidate_id}>"