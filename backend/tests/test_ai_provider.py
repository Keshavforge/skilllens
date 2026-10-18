import asyncio

import httpx
import pytest

from app.services import ai_provider
from app.services.ai_provider import AIProviderError


def test_missing_api_key_disables_optional_provider(monkeypatch) -> None:
    monkeypatch.delenv("AI_API_KEY", raising=False)
    result = asyncio.run(ai_provider.generate_ai_advice("resume", "job description", [], []))
    assert result is None


def test_provider_rate_limit_uses_safe_error(monkeypatch) -> None:
    monkeypatch.setenv("AI_API_KEY", "test-only-not-a-real-secret")

    class FakeResponse:
        def raise_for_status(self):
            request = httpx.Request("POST", "https://provider.invalid")
            response = httpx.Response(429, request=request)
            raise httpx.HTTPStatusError("rate limited", request=request, response=response)

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return None

        async def post(self, *args, **kwargs):
            return FakeResponse()

    monkeypatch.setattr(ai_provider.httpx, "AsyncClient", FakeClient)
    with pytest.raises(AIProviderError):
        asyncio.run(ai_provider.generate_ai_advice("resume", "job description", [], []))
