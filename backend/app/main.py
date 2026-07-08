from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, ranking, users, candidate
from app.routers import job as job_router
from app.models import user          # noqa: F401
from app.models import refresh_token # noqa: F401
from app.models import job           # noqa: F401

app = FastAPI(title="Multistack Hire API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/v1/auth",      tags=["Authentication"])
app.include_router(ranking.router,    prefix="/api/v1/ranking",   tags=["Ranking Engine"])
app.include_router(job_router.router, prefix="/api/v1/jobs",      tags=["Jobs"])
app.include_router(users.router,      prefix="/api/v1/users",     tags=["Users"])
app.include_router(candidate.router,  prefix="/api/v1/candidate", tags=["Candidate"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}