import uuid
import json
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum as SAEnum, Integer, Text, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
import enum


class UserRole(str, enum.Enum):
    admin = "admin"
    recruiter = "recruiter"
    candidate = "candidate"


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String, primary_key=True,
        default=lambda: str(uuid.uuid4())
    )
    full_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(
        String(255), unique=True, nullable=False, index=True
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SAEnum(UserRole), nullable=False,
        default=UserRole.candidate
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # ── Profile fields ─────────────────────────────────────────
    phone_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    location: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    years_of_experience: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Stored as JSON string e.g. '["React","Python","Node.js"]'
    skills: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ── Social links (critical for ML) ─────────────────────────
    github_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stackoverflow_username: Mapped[str | None] = mapped_column(String(100), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # ── Resume / CV ─────────────────────────────────────────────
    resume_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    resume_uploaded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # ── ML Score ────────────────────────────────────────────────
    ranking_score: Mapped[float | None] = mapped_column(Float, nullable=True)

  # ── Profile completion ───────────────────────────────────────
# True when github_username + stackoverflow_username + resume_url all filled
    profile_completed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,          # Python default (used by SQLAlchemy)
        server_default="false", # PostgreSQL default (used during migration)
        nullable=False
)

    # ── Relationships ────────────────────────────────────────────
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        "RefreshToken", back_populates="user",
        cascade="all, delete-orphan"
    )
    posted_jobs: Mapped[list["Job"]] = relationship(
        "Job", back_populates="recruiter",
        cascade="all, delete-orphan"
    )
    applications: Mapped[list["Application"]] = relationship(
        "Application", back_populates="candidate",
        cascade="all, delete-orphan"
    )

    def get_skills(self) -> list[str]:
        """Parse skills JSON string to list."""
        if not self.skills:
            return []
        try:
            return json.loads(self.skills)
        except Exception:
            return []

    def set_skills(self, skills_list: list[str]) -> None:
        """Store skills list as JSON string."""
        self.skills = json.dumps(skills_list)

    def check_profile_completed(self) -> bool:
        """Profile is complete when these 3 are filled."""
        return all([
            self.github_username,
            self.stackoverflow_username,
            self.resume_url,
        ])

    def __repr__(self):
        return f"<User {self.email} ({self.role})>"