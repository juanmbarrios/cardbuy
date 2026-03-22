"""
TCG Marketplace Platform - Main Application
"""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config.logging import setup_logging
from config.settings import (
    APP_NAME,
    APP_VERSION,
    CORS_ORIGINS,
    DEBUG,
    API_V1_PREFIX
)

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    logger.info(f"Starting {APP_NAME} v{APP_VERSION}")

    # Startup logic here
    # - Initialize database connections
    # - Setup background tasks
    # - Load initial data

    yield

    # Shutdown logic here
    # - Close database connections
    # - Cleanup resources
    logger.info(f"Shutting down {APP_NAME}")

# Create FastAPI application
app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="TCG Marketplace Platform - A comprehensive trading card game marketplace",
    debug=DEBUG,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": APP_NAME,
        "version": APP_VERSION
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": f"Welcome to {APP_NAME}",
        "version": APP_VERSION,
        "docs": "/docs",
        "health": "/health"
    }

# API v1 router will be included here
# app.include_router(api_v1_router, prefix=API_V1_PREFIX)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=DEBUG,
        log_level="info"
    )