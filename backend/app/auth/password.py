from passlib.context import CryptContext

# CryptContext manages which hashing algorithm to use and how to verify passwords.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain_password: str) -> str:
    """Turn a plain password into a bcrypt hash."""
    return pwd_context.hash(plain_password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Check if a plain password matches a stored hash.
    Returns True if match, False otherwise.
    Never compares raw strings — always use this function.
    """
    return pwd_context.verify(plain_password, hashed_password)