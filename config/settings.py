# TCG Marketplace Platform - Configuration

# Application Settings
APP_NAME = "TCG Marketplace"
APP_VERSION = "0.1.0"
DEBUG = True

# Database Configuration
DATABASE_URL = "postgresql://user:password@localhost:5432/tcg_marketplace"

# Redis Configuration (for queue and caching)
REDIS_URL = "redis://localhost:6379"

# JWT Configuration
JWT_SECRET_KEY = "your-secret-key-here"  # Change in production
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = 30

# External Services
STRIPE_PUBLIC_KEY = "pk_test_..."  # Stripe public key
STRIPE_SECRET_KEY = "sk_test_..."  # Stripe secret key

# Email Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "your-email@gmail.com"
SMTP_PASSWORD = "your-app-password"

# Logging Configuration
LOG_LEVEL = "INFO"
LOG_FILE = "logs/app.log"

# File Upload Configuration
UPLOAD_FOLDER = "uploads/"
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

# Security Settings
SECRET_KEY = "your-secret-key-change-in-production"
SESSION_COOKIE_SECURE = False  # Set to True in production with HTTPS
SESSION_COOKIE_HTTPONLY = True

# API Configuration
API_V1_PREFIX = "/api/v1"
API_DOCS_URL = "/docs"
API_REDOC_URL = "/redoc"

# CORS Settings
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:8080"]

# Rate Limiting
RATE_LIMIT_REQUESTS = 100
RATE_LIMIT_WINDOW = 60  # seconds