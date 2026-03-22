from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from config.logging import setup_logging
from config.settings import APP_NAME, APP_VERSION, CORS_ORIGINS, DEBUG
from core.database import Base, engine
from core.models import User

setup_logging()

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    debug=DEBUG,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}


@app.get("/stats")
async def stats():
    return {"app": APP_NAME, "version": APP_VERSION}


@app.get("/users")
async def list_users():
    return {"message": "user listing to be implemented"}
