from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import max_upload_bytes
from app.models.skills import SKILL_CATALOG
from app.schemas.api import (
    AnalyzeRequest,
    AnalysisResponse,
    ResumeParseResponse,
    SkillInfo,
    SkillsResponse,
)
from app.services.analysis import analyze_resume
from app.services.resume_parser import (
    ResumeParseError,
    UnsupportedResumeType,
    extract_resume_text,
)

router = APIRouter(prefix="/api")


@router.get("/health")
async def health() -> dict[str, bool | str]:
    import os

    return {"status": "ok", "ai_configured": bool(os.getenv("AI_API_KEY", "").strip())}


@router.get("/skills", response_model=SkillsResponse)
async def list_skills() -> SkillsResponse:
    return SkillsResponse(
        skills=[SkillInfo(name=rule.name, aliases=list(rule.aliases)) for rule in SKILL_CATALOG],
        note="Catalog matches are mentions only; they do not verify proficiency or experience.",
    )


@router.post("/resume/parse", response_model=ResumeParseResponse)
async def parse_resume(file: UploadFile = File(...)) -> ResumeParseResponse:
    filename = file.filename or "upload"
    suffix = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    try:
        if suffix not in {"pdf", "docx"}:
            raise HTTPException(status_code=415, detail="Upload a PDF or DOCX file.")

        content = await file.read(max_upload_bytes() + 1)
        if len(content) > max_upload_bytes():
            raise HTTPException(status_code=413, detail="File is larger than the configured upload limit.")
        try:
            text = extract_resume_text(filename, content)
        except UnsupportedResumeType as exc:
            raise HTTPException(status_code=415, detail=str(exc)) from exc
        except ResumeParseError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        await file.close()

    return ResumeParseResponse(
        filename=filename,
        text=text,
        character_count=len(text),
        note="Extracted text is not stored. Review it before running an analysis.",
    )


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze(payload: AnalyzeRequest) -> AnalysisResponse:
    return await analyze_resume(payload.resume_text, payload.job_description)
