from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field


JobStatus = Literal["queued", "running", "completed", "failed"]


class AuditJobCreate(BaseModel):
    model_key: str = Field(..., examples=["sd15-ddim"])
    audit_method: str = Field(default="recon", examples=["recon"])
    image_name: str = Field(..., examples=["example.png"])


class AuditJobResponse(BaseModel):
    job_id: str
    status: JobStatus
    model_key: str
    audit_method: str
    image_name: str
    created_at: str
    message: str | None = None
    risk_score: float | None = None
    is_likely_member: bool | None = None
    summary_path: str | None = None
    artifact_path: str | None = None


class ModelOption(BaseModel):
    key: str
    label: str
    access_level: Literal["black-box", "gray-box", "white-box"]
    availability: Literal["ready", "partial", "planned"]


def build_stub_job(payload: AuditJobCreate) -> AuditJobResponse:
    timestamp = datetime.now(timezone.utc)
    job_id = f"job_{int(timestamp.timestamp())}"
    return AuditJobResponse(
        job_id=job_id,
        status="queued",
        model_key=payload.model_key,
        audit_method=payload.audit_method,
        image_name=payload.image_name,
        created_at=timestamp.isoformat(),
        message="Stub job created. Research repo integration is the next step.",
    )
