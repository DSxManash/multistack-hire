from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache


def normalize_database_url(url: str) -> str:
    """
    Render/Heroku provide postgresql:// (or postgres://) URLs.
    SQLAlchemy async + asyncpg require postgresql+asyncpg://.
    Managed Postgres also needs SSL.
    """
    normalized = url.strip()

    if normalized.startswith("postgres://"):
        normalized = "postgresql+asyncpg://" + normalized[len("postgres://"):]
    elif normalized.startswith("postgresql://"):
        normalized = "postgresql+asyncpg://" + normalized[len("postgresql://"):]
    elif not normalized.startswith("postgresql+asyncpg://"):
        return normalized

    parsed = urlparse(normalized)
    host = (parsed.hostname or "").lower()
    is_local = host in {"localhost", "127.0.0.1", "db", "postgres"}

    query = dict(parse_qsl(parsed.query, keep_blank_values=True))
    if not is_local and "ssl" not in query and "sslmode" not in query:
        query["ssl"] = "require"

    return urlunparse(parsed._replace(query=urlencode(query)))


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

    # Refresh Token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    APP_ENV: str = "development"
    APP_NAME: str = "multistack-hire"

    # CORS — comma-separated frontend origins (no trailing slash).
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "https://multistackhire.manashdevbhatta.com.np,"
        "https://dsxmanash.github.io"
    )
    # Optional regex (e.g. preview deploys). Empty string disables.
    CORS_ORIGIN_REGEX: str = r"https://.*\.github\.io"

    # MinIO
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET_NAME: str = "multistack-hire-resumes"
    MINIO_SECURE: bool = False

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def async_database_url(self) -> str:
        return normalize_database_url(self.DATABASE_URL)

    @property
    def cors_origin_list(self) -> list[str]:
        return [
            origin.strip().rstrip("/")
            for origin in self.CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV.lower() == "production"


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
