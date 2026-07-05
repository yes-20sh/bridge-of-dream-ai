from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.router import router as api_router
from core.supabase import Base, engine
import os
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from core.rate_limit import limiter
import shared.database.model_request  # Import models to register them
import shared.database.model_resume
import shared.database.model_user
import shared.database.model_last_search
import shared.database.model_ats_resume
import shared.database.model_saved_job
import shared.database.model_connection
import shared.database.model_job_applied
from middleware.auth_middleware import AuthMiddleware
import core.cloudinary # ensure cloudinary is configured

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bridge of Dream AI API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
origins = allowed_origins_env.split(",") if allowed_origins_env else [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:3001"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Cannot use "*" with allow_credentials=True
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(api_router, prefix="/api")


@app.get("/")
def read_root():
    return {"message": "Welcome to the Bridge of Dream AI API"}
