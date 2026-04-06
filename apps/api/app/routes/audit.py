from fastapi import APIRouter

from app.schemas.audit import AuditJobCreate, AuditJobResponse, ModelOption, build_stub_job


router = APIRouter(prefix="/api/v1", tags=["audit"])

MODEL_OPTIONS = [
    ModelOption(
        key="sd15-ddim",
        label="Stable Diffusion 1.5 + DDIM",
        access_level="black-box",
        availability="ready",
    ),
    ModelOption(
        key="kandinsky-v22",
        label="Kandinsky v2.2",
        access_level="black-box",
        availability="partial",
    ),
    ModelOption(
        key="dit-xl2-256",
        label="DiT-XL/2 256",
        access_level="black-box",
        availability="partial",
    ),
]


@router.get("/models", response_model=list[ModelOption])
def list_models() -> list[ModelOption]:
    return MODEL_OPTIONS


@router.post("/audit/jobs", response_model=AuditJobResponse)
def create_audit_job(payload: AuditJobCreate) -> AuditJobResponse:
    return build_stub_job(payload)


@router.get("/audit/jobs/{job_id}", response_model=AuditJobResponse)
def get_audit_job(job_id: str) -> AuditJobResponse:
    return AuditJobResponse(
        job_id=job_id,
        status="running",
        model_key="sd15-ddim",
        audit_method="recon",
        image_name="placeholder.png",
        created_at="2026-04-06T00:00:00+00:00",
        message="Stub status endpoint. Real job persistence is not wired yet.",
    )
