"""
Authentication and authorization utilities
"""

import logging
from datetime import datetime, timedelta
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt

from config.settings import JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRE_MINUTES
from .models import User

logger = logging.getLogger(__name__)

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=JWT_ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm="HS256")

    return encoded_jwt

def verify_token(token: str) -> Optional[dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        return payload
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return None

def get_current_user(token: str) -> Optional[User]:
    """Get current user from JWT token"""
    # This would typically query the database
    # For now, return None as we don't have DB connection
    payload = verify_token(token)
    if not payload:
        return None

    # In a real implementation, you would:
    # 1. Extract user_id from payload
    # 2. Query database for user
    # 3. Return user object or None

    logger.info(f"Token verified for user: {payload.get('sub')}")
    return None  # Placeholder

def authenticate_user(email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    # This would typically:
    # 1. Query database for user by email
    # 2. Verify password hash
    # 3. Return user object or None

    logger.info(f"Authentication attempt for: {email}")
    return None  # Placeholder