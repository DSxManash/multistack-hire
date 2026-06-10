from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.post("/login")
async def login():
    return {"access_token": "routes work", "token_type": "bearer"}