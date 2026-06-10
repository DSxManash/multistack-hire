from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # App
    APP_ENV: str = "development"
    APP_NAME: str = "multistack-hire"

    class Config:
        env_file = ".env"           # tells Pydantic where to look
        env_file_encoding = "utf-8"

# lru_cache means this function runs ONCE and caches the result
# So Settings() is not recreated on every request — just once at startup
@lru_cache()
def get_settings() -> Settings:
    return Settings()

# A single importable instance used across the app
settings = get_settings()