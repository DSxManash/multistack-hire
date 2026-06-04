from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def get_rankings():
    return {"message": "Ranking engine active"}