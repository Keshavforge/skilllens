from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.core.config import MAX_TEXT_CHARS, MIN_TEXT_CHARS


class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    resume_text: str = Field(
        min_length=MIN_TEXT_CHARS,
        max_length=MAX_TEXT_CHARS,
        description="Resume text, with at least 40 non-whitespace characters.",
    )
    job_description: str = Field(
        min_length=MIN_TEXT_CHARS,
        max_length=MAX_TEXT_CHARS,
        description="Job description, with at least 40 non-whitespace characters.",
    )


class SkillInfo(BaseModel):
    name: str
    aliases: list[str]


class SkillsResponse(BaseModel):
    skills: list[SkillInfo]
    note: str


class ResumeParseResponse(BaseModel):
    filename: str
    text: str
    character_count: int
    note: str


class SkillResult(BaseModel):
    name: str
    status: Literal["matched", "not_found_in_resume"]
    evidence: str | None = None


class Recommendation(BaseModel):
    title: str
    detail: str
    related_skill: str | None = None


class RoadmapItem(BaseModel):
    phase: str
    title: str
    actions: list[str]
    estimated_time: str
    target_skill: str | None = None


class AnalysisResponse(BaseModel):
    score: float | None
    score_explanation: str
    summary: str
    required_skill_count: int
    matched_count: int
    not_found_count: int
    requirements: list[SkillResult]
    recommendations: list[Recommendation]
    roadmap: list[RoadmapItem]
    resume_checklist: list[str]
    advice_source: Literal["rule_based", "ai"]
    advice_notice: str


class AILearningStep(BaseModel):
    target_skill: str | None = Field(default=None, max_length=80)
    title: str = Field(min_length=4, max_length=120)
    actions: list[str] = Field(min_length=1, max_length=5)
    estimated_time: str = Field(min_length=2, max_length=40)


class AIAdvice(BaseModel):
    summary: str = Field(min_length=10, max_length=500)
    resume_improvements: list[str] = Field(min_length=1, max_length=5)
    learning_steps: list[AILearningStep] = Field(min_length=1, max_length=5)
