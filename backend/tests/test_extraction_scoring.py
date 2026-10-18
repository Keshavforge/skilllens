from app.services.extraction import extract_skill_evidence, normalize_skill_mentions
from app.services.scoring import calculate_match


def test_normalizes_aliases_case_and_spacing() -> None:
    text = "Built with JS, React.js, PostgreSQL, RESTful APIs, and CI / CD."
    assert normalize_skill_mentions(text) == ["JavaScript", "React", "SQL", "REST APIs", "CI/CD"]


def test_avoids_simple_substring_false_matches() -> None:
    assert normalize_skill_mentions("A digital project used jobs and a reaction.") == []


def test_evidence_is_a_matching_sentence() -> None:
    evidence = extract_skill_evidence("Overview. Built a REST API using Python for a course project.")
    assert evidence["REST APIs"] == "Built a REST API using Python for a course project."
    assert evidence["Python"] == "Built a REST API using Python for a course project."


def test_score_uses_unique_identified_job_requirements() -> None:
    result = calculate_match(
        "I built a React dashboard and used Python for data cleanup.",
        "We need React, Python, and Docker. React experience is useful too.",
    )
    assert result["required"] == ["Python", "React", "Docker"]
    assert result["matched"] == ["Python", "React"]
    assert result["missing"] == ["Docker"]
    assert result["score"] == 66.7


def test_zero_detected_requirements_has_no_score() -> None:
    result = calculate_match("A sufficiently long resume text.", "We value communication and curiosity.")
    assert result["score"] is None
    assert result["required"] == []


def test_empty_text_does_not_crash_extraction() -> None:
    assert normalize_skill_mentions("") == []
    assert extract_skill_evidence("   ") == {}
