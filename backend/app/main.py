from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, ranking


# Import models so Alembic can detect them for migrations
from app.models import user
app = FastAPI(title="Multistack Candidate Ranking API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # will Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Modules
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(ranking.router, prefix="/api/v1/ranking", tags=["Ranking Engine"])

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy", "version": "1.0.0"}