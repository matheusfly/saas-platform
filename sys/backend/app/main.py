from fastapi import FastAPI, Request, Response
from app.api.api import api_router
from app.core.database import engine, Base
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.middleware("http")
async def log_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    logger.info(f"Response headers: {response.headers}")
    return response

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")