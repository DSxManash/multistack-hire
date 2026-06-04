from fastapi import APIRouter, HTTPException, status

router = APIRouter()

@router.post("/login")
async def login():
    return {"access_token": "routes_check_gareko", "token_type": "bearer"}