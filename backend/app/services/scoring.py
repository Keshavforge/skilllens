from __future__ import annotations

from app.schemas.api import SkillResult
from app.services.extraction import extract_skill_evidence, normalize_skill_mentions

SCORE_EXPLANATION = (
    "Baseline skill coverage = matched unique catalog skills mentioned in the job description "
    "divided by all unique catalog skills detected in the job description, multiplied by 100. "
    "This measures mentions, not proficiency or hiring probability. If no catalog skills are "
    "detected in the job description, a score is not calculated."
)


def calculate_match(resume_text: str, job_description: str) -> dict[str, object]:
    required = normalize_skill_mentions(job_description)
    resume_evidence = extract_skill_evidence(resume_text)
    matched = [name for name in required if name in resume_evidence]
    missing = [name for name in required if name not in resume_evidence]
    score = round((len(matched) / len(required)) * 100, 1) if required else None
    rows = [
        SkillResult(
            name=name,
            status="matched" if name in resume_evidence else "not_found_in_resume",
            evidence=resume_evidence.get(name),
        )
        for name in required
    ]
    return {
        "score": score,
        "required": required,
        "matched": matched,
        "missing": missing,
        "requirements": rows,
        "score_explanation": SCORE_EXPLANATION,
    }
