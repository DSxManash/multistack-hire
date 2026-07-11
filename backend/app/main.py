from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, ranking, users, candidate
from app.routers import job as job_router
from app.models import user          # noqa: F401
from app.models import refresh_token # noqa: F401
from app.models import job           # noqa: F401

app = FastAPI(title="Multistack Hire API", version="1.0.0")

# Browser login from the deployed frontend requires these origins to match
# the request Origin header exactly (scheme + host, no trailing slash).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_origin_regex=settings.CORS_ORIGIN_REGEX or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.on_event("startup")
async def log_cors_origins() -> None:
    print(f"[cors] allow_origins={settings.cors_origin_list}")
    if settings.CORS_ORIGIN_REGEX:
        print(f"[cors] allow_origin_regex={settings.CORS_ORIGIN_REGEX}")


app.include_router(auth.router,       prefix="/api/v1/auth",      tags=["Authentication"])
app.include_router(ranking.router,    prefix="/api/v1/ranking",   tags=["Ranking Engine"])
app.include_router(job_router.router, prefix="/api/v1/jobs",      tags=["Jobs"])
app.include_router(users.router,      prefix="/api/v1/users",     tags=["Users"])
app.include_router(candidate.router,  prefix="/api/v1/candidate", tags=["Candidate"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}