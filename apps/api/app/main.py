from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routes.audit import router as audit_router
from app.routes.health import router as health_router


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Platform shell API for DiffAudit",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(audit_router)
