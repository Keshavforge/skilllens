from app.schemas.api import Recommendation, RoadmapItem


def build_rule_based_advice(
    missing_skills: list[str], matched_skills: list[str]
) -> tuple[str, list[Recommendation], list[RoadmapItem], list[str]]:
    if missing_skills:
        summary = (
            f"The supplied resume mentions {len(matched_skills)} of the "
            f"{len(matched_skills) + len(missing_skills)} recognized job-description skills. "
            "Unmatched items below were not found in the supplied text; they may still be skills you have."
        )
        recommendations = [
            Recommendation(
                title=f"Build verifiable evidence for {skill}",
                detail=(
                    f"If you have experience with {skill}, add a concise, truthful resume bullet "
                    "that names the work and its context. If not, choose a small practice task before listing it."
                ),
                related_skill=skill,
            )
            for skill in missing_skills[:4]
        ]
        roadmap = [
            RoadmapItem(
                phase=f"Phase {index + 1}",
                title=f"Practice {skill}",
                actions=[
                    f"Review a beginner resource or official documentation for {skill}.",
                    f"Complete a small project or exercise that uses {skill} and keep notes on what you built.",
                    "Only add the skill to the resume when you can describe your own evidence accurately.",
                ],
                estimated_time="1–2 weeks (adjust to your schedule)",
                target_skill=skill,
            )
            for index, skill in enumerate(missing_skills[:3])
        ]
        checklist = [
            "Keep every resume claim accurate and supportable.",
            "For each relevant skill you do have, add a concrete example of where you used it.",
            "Use job-description terminology only where it truthfully describes your experience.",
        ]
    else:
        summary = (
            "Every recognized job-description skill was also mentioned in the supplied resume. "
            "This does not evaluate depth, recency, or context."
        )
        recommendations = [
            Recommendation(
                title="Strengthen evidence, not keyword count",
                detail=(
                    "Review each matched sentence and make sure it describes your own work, "
                    "the context, and a concrete outcome where you can substantiate one."
                ),
            )
        ]
        roadmap = [
            RoadmapItem(
                phase="Next step",
                title="Review depth and recency",
                actions=[
                    "Check that the resume gives a specific example for each matched requirement.",
                    "Identify one advanced topic in the target role and make a focused practice plan.",
                ],
                estimated_time="1–2 hours to review",
            )
        ]
        checklist = [
            "Verify that every matched skill is supported by an accurate resume example.",
            "Prioritize clear impact and context over repeating keywords.",
            "Review spelling, dates, and consistency before sharing the resume.",
        ]
    return summary, recommendations, roadmap, checklist
