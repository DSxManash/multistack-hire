from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine
from app.routers import auth, ranking, users, candidate
from app.routers import job as job_router
from app.models import user          # noqa: F401
from app.models import refresh_token # noqa: F401
from app.models import job           # noqa: F401

from app.routers import company          # add to imports
from app.models import company as company_model  # noqa: F401

app = FastAPI(title="Multistack Hire API", version="1.0.0")

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
async def log_startup() -> None:
    print(f"[cors] allow_origins={settings.cors_origin_list}")
    if settings.CORS_ORIGIN_REGEX:
        print(f"[cors] allow_origin_regex={settings.CORS_ORIGIN_REGEX}")
    print(f"[db] ssl={settings.use_database_ssl} verify=disabled env={settings.APP_ENV}")

    # Ensure resume (and other file) bucket exists before serving uploads
    try:
        from app.utils.minio_client import ensure_storage_ready

        info = await ensure_storage_ready()
        print(
            f"[minio] bucket={info['bucket']} ready "
            f"(created={info.get('created', False)})"
        )
    except Exception as exc:  # noqa: BLE001 — don't block API boot if MinIO is briefly down
        print(f"[minio] bucket init failed: {type(exc).__name__}: {exc}")


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Exception handlers catch subclasses too — re-emit normal FastAPI errors.
    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    if isinstance(exc, RequestValidationError):
        return JSONResponse(status_code=422, content={"detail": exc.errors()})

    print(f"[error] {request.method} {request.url.path}: {type(exc).__name__}: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "error_type": type(exc).__name__,
            "error": str(exc)[:300],
        },
    )


app.include_router(auth.router,       prefix="/api/v1/auth",      tags=["Authentication"])
app.include_router(ranking.router,    prefix="/api/v1/ranking",   tags=["Ranking Engine"])
app.include_router(job_router.router, prefix="/api/v1/jobs",      tags=["Jobs"])
app.include_router(users.router,      prefix="/api/v1/users",     tags=["Users"])
app.include_router(candidate.router,  prefix="/api/v1/candidate", tags=["Candidate"])
app.include_router(company.router, prefix="/api/v1/company", tags=["Company"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}


@app.get("/health/db", tags=["Health"])
async def health_db():
    """Diagnose database connectivity (no secrets returned)."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
            tables = await conn.execute(
                text(
                    "SELECT tablename FROM pg_tables "
                    "WHERE schemaname = 'public' ORDER BY tablename"
                )
            )
            table_names = [row[0] for row in tables.fetchall()]
        return {
            "status": "ok",
            "ssl": settings.use_database_ssl,
            "tables": table_names,
        }
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "ssl": settings.use_database_ssl,
                "error_type": type(exc).__name__,
                "error": str(exc)[:400],
            },
        )


@app.get("/health/storage", tags=["Health"])
async def health_storage():
    """Diagnose MinIO connectivity and ensure the app bucket exists."""
    from app.utils.minio_client import ensure_storage_ready

    try:
        result = await ensure_storage_ready()
        return {
            "status": "ok",
            "bucket": result["bucket"],
            "bucket_exists": True,
            "created": result.get("created", False),
        }
    except Exception as exc:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "error_type": type(exc).__name__,
                "error": str(exc)[:400],
            },
        )
