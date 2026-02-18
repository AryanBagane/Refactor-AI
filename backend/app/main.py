from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.init_config import init_db
from app.routers import auth, scan
from app.utils.logger import get_logger

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("🚀 Starting Refactor AI Backend...")
    await init_db()
    logger.info("✅ Database tables initialized")
    yield
    logger.info("👋 Shutting down Refactor AI Backend...")


app = FastAPI(
    title="Refactor AI",
    description="The Anti-ATS Resume Optimizer — analyze resumes against job descriptions",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(scan.router, prefix="/api")


@app.get("/")
async def root():
    return {"message": "Refactor AI API is running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
