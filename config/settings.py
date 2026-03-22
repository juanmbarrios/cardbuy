import os

# Application
APP_NAME = "TCG Marketplace"
APP_VERSION = "0.1.0"
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Database
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db.sqlite3")

# Redis/Queue
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# JWT Authentication
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-this-secret")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_MINUTES = int(os.getenv("JWT_EXPIRATION_MINUTES", 30))

# CORS
CORS_ORIGINS = [origin.strip() for origin in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")]
