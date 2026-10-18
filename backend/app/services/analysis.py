from __future__ import annotations

import os

from app.schemas.api import (
    AnalysisResponse,
    Recommendation,
    RoadmapItem,
)
from app.services.ai_provider import AIProviderError, generate_ai_advice
from app.services.recommendations import build_rule_based_advice
from app.services.scoring import calculate_match


async def analyze_resume(resume_text: str, job_description: str) -> AnalysisResponse:
    match = calculate_match(resume_text, job_description)
    matched = match["matched"]
    missing = match["missing"]
    summary, recommendations, roadmap, checklist = build_rule_based_advice(missing, matched)

    configured = bool(os.getenv("AI_API_KEY", "").strip())
    try:
        ai_advice = await generate_ai_advice(
            resume_text, job_description, matched, missing
        )
    except AIProviderError:
        ai_advice = None

    if ai_advice is not None:
        summary = ai_advice.summary
        recommendations = [
            Recommendation(title=f"Resume suggestion {index + 1}", detail=item)
            for index, item in enumerate(ai_advice.resume_improvements)
        ]
        roadmap = [
            RoadmapItem(
                phase=f"Phase {index + 1}",
                title=step.title,
                actions=step.actions,
                estimated_time=step.estimated_time,
                target_skill=step.target_skill,
            )
            for index, step in enumerate(ai_advice.learning_steps)
        ]
        notice = "Advice below is AI-generated from the supplied text; review it before use."
        advice_source = "ai"
    elif configured:
        notice = "AI suggestions are unavailable right now; showing rule-based advice instead."
        advice_source = "rule_based"
    else:
        notice = "AI suggestions are unavailable because no AI_API_KEY is configured; showing rule-based advice."
        advice_source = "rule_based"

    return AnalysisResponse(
        score=match["score"],
        score_explanation=match["score_explanation"],
        summary=summary,
        required_skill_count=len(match["required"]),
        matched_count=len(matched),
        not_found_count=len(missing),
        requirements=match["requirements"],
        recommendations=recommendations,
        roadmap=roadmap,
        resume_checklist=checklist,
        advice_source=advice_source,
        advice_notice=notice,
    )
