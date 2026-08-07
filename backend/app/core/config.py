from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

def normalize_database_url(url: str) -> str:
    """
    Render/Heroku provide postgresql:// (or postgres://) URLs.
    SQLAlchemy async + asyncpg require postgresql+asyncpg://.

    SSL query params are stripped here — asyncpg gets SSL via connect_args
    (see database.py), because ?ssl=require in the URL is unreliable.
    """
    normalized = url.strip()

    if normalized.startswith("postgres://"):
        normalized = "postgresql+asyncpg://" + normalized[len("postgres://") :]
    elif normalized.startswith("postgresql://"):
        normalized = "postgresql+asyncpg://" + normalized[len("postgresql://") :]
    elif not normalized.startswith("postgresql+asyncpg://"):
        return normalized

    parsed = urlparse(normalized)
    query = {
        key: value
        for key, value in parse_qsl(parsed.query, keep_blank_values=True)
        if key.lower() not in {"ssl", "sslmode"}
    }
    return urlunparse(parsed._replace(query=urlencode(query)))


def database_needs_ssl(url: str) -> bool:
    """
    Managed Postgres providers require TLS.
    Local Docker / Render private hostnames do not.
    """
    host = (urlparse(url).hostname or "").lower()
    if host in {"localhost", "127.0.0.1", "db", "postgres"}:
        return False
    if host.endswith(".render.com"):
        return True
    if any(
        token in host
        for token in (
            "supabase.co",
            "supabase.com",
            "neon.tech",
            "amazonaws.com",
            "pooler.supabase",
        )
    ):
        return True
    # Any remote host with a dotted public name — prefer TLS
    if "." in host:
        return True
    return False

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DATABASE_SSL: str = "auto"

    # JWT
    SECRET_KEY: str = "change-this-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15

    # Refresh Token
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # App
    APP_ENV: str = "development"
    APP_NAME: str = "multistack-hire"

    # CORS
    CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "https://multistackhire.manashdevbhatta.com.np,"
        "https://dsxmanash.github.io"
    )
    CORS_ORIGIN_REGEX: str = r"https://.*\.github\.io"

    # MinIO — internal Docker hostname for server-side upload/download
    MINIO_ENDPOINT: str = "minio:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin123"
    MINIO_BUCKET_NAME: str = "multistack-hire-resumes"
    MINIO_SECURE: bool = False
    # Optional public host used only when minting browser-facing presigned URLs
    # (e.g. storage.example.com served by Caddy). Falls back to MINIO_ENDPOINT.
    MINIO_PUBLIC_ENDPOINT: str | None = None
    MINIO_PUBLIC_SECURE: bool | None = None

    # External APIs
    GITHUB_API_TOKEN: Optional[str] = None
    GITHUB_API_URL: str = "https://api.github.com"
    LEETCODE_GRAPHQL_URL: str = "https://leetcode.com/graphql"
    GITHUB_API_TIMEOUT: int = 15
    LEETCODE_API_TIMEOUT: int = 15

    # Pydantic v2 configuration
    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parents[2] / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def async_database_url(self) -> str:
        return normalize_database_url(self.DATABASE_URL)

    @property
    def use_database_ssl(self) -> bool:
        flag = (self.DATABASE_SSL or "auto").strip().lower()

        if flag in {"1", "true", "yes", "require"}:
            return True

        if flag in {"0", "false", "no", "disable", "disabled"}:
            return False

        return database_needs_ssl(self.async_database_url)

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
    