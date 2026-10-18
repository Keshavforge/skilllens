import asyncio

from app.services import analysis
from app.services.ai_provider import AIProviderError


def test_provider_error_falls_back_to_rule_based_recommendations(monkeypatch) -> None:
    monkeypatch.setenv("AI_API_KEY", "configured-for-test")

    async def fail_provider(*args, **kwargs):
        raise AIProviderError()

    monkeypatch.setattr(analysis, "generate_ai_advice", fail_provider)
    result = asyncio.run(analysis.analyze_resume(
        "I used React and Python to build a web application for a class project.",
        "The job requires React, Python, Docker, and collaboration with product teams.",
    ))
    assert result.advice_source == "rule_based"
    assert "unavailable" in result.advice_notice
    assert result.recommendations
