"""
Database models for the TCG Marketplace Platform
"""

import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

class UserRole(str, enum.Enum):
    """User role enumeration"""
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"

class UserStatus(str, enum.Enum):
    """User status enumeration"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    PENDING_VERIFICATION = "pending_verification"

class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(20), nullable=False, default=UserRole.BUYER)
    status = Column(String(20), nullable=False, default=UserStatus.PENDING_VERIFICATION)
    email_verified = Column(Boolean, default=False)
    phone = Column(String(20))
    avatar_url = Column(String(500))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login = Column(DateTime(timezone=True))

    # Relationships
    seller_profile = relationship("SellerProfile", back_populates="user", uselist=False)

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email}, role={self.role})>"

class SellerProfile(Base):
    """Seller profile model"""
    __tablename__ = "seller_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    business_name = Column(String(255))
    business_address = Column(Text)
    tax_id = Column(String(50))
    kyc_verified = Column(Boolean, default=False)
    kyb_verified = Column(Boolean, default=False)
    stripe_account_id = Column(String(255))
    rating = Column(Integer, default=0)  # 0-100 scale
    total_sales = Column(Integer, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="seller_profile")

    def __repr__(self):
        return f"<SellerProfile(id={self.id}, user_id={self.user_id}, business_name={self.business_name})>"