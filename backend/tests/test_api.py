import asyncio
from io import BytesIO

import httpx

from docx import Document

from app.api import routes
from app.main import app

class SyncAPIClient:
    async def _request(self, method: str, path: str, **kwargs):
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app), base_url="http://testserver"
        ) as client:
            return await client.request(method, path, **kwargs)

    def get(self, path: str, **kwargs):
        return asyncio.run(self._request("GET", path, **kwargs))

    def post(self, path: str, **kwargs):
        return asyncio.run(self._request("POST", path, **kwargs))


client = SyncAPIClient()


def test_health_and_catalog() -> None:
    assert client.get("/api/health").json()["status"] == "ok"
    response = client.get("/api/skills")
    assert response.status_code == 200
    assert "Automated testing" in [skill["name"] for skill in response.json()["skills"]]


def test_analyze_rejects_short_inputs_without_echoing_text() -> None:
    response = client.post(
        "/api/analyze",
        json={"resume_text": "short", "job_description": "also short"},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "validation_error"
    assert "short" not in response.text



def test_analyze_rejects_empty_and_missing_fields() -> None:
    empty = client.post(
        "/api/analyze", json={"resume_text": "", "job_description": ""}
    )
    missing = client.post("/api/analyze", json={"resume_text": "some text"})
    assert empty.status_code == 422
    assert missing.status_code == 422


def test_analyze_returns_real_rule_based_result_when_ai_is_not_configured(monkeypatch) -> None:
    monkeypatch.delenv("AI_API_KEY", raising=False)
    response = client.post(
        "/api/analyze",
        json={
            "resume_text": "I built a React application with Python and used Git to track work on the project.",
            "job_description": "The role needs React, Python, Docker, and strong collaboration skills for the engineering team.",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["score"] == 66.7
    assert data["matched_count"] == 2
    assert data["not_found_count"] == 1
    assert data["requirements"][0]["evidence"]
    assert data["advice_source"] == "rule_based"
    assert "AI_API_KEY" in data["advice_notice"]


def test_upload_rejects_unsupported_extension() -> None:
    response = client.post(
        "/api/resume/parse",
        files={"file": ("resume.txt", b"some content", "text/plain")},
    )
    assert response.status_code == 415
    assert response.json()["error"]["message"] == "Upload a PDF or DOCX file."


def test_upload_rejects_oversized_file(monkeypatch) -> None:
    monkeypatch.setattr(routes, "max_upload_bytes", lambda: 16)
    response = client.post(
        "/api/resume/parse",
        files={"file": ("resume.docx", b"PK" + (b"x" * 32), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert response.status_code == 413


def test_docx_upload_is_parsed_in_memory() -> None:
    document = Document()
    document.add_paragraph("Experience: built a portfolio project using React, Python, Git, and automated testing.")
    buffer = BytesIO()
    document.save(buffer)
    response = client.post(
        "/api/resume/parse",
        files={"file": ("resume.docx", buffer.getvalue(), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert response.status_code == 200
    data = response.json()
    assert "React" in data["text"]
    assert data["character_count"] == len(data["text"])



def test_text_pdf_upload_is_parsed() -> None:
    import fitz

    document = fitz.open()
    page = document.new_page()
    page.insert_text(
        (72, 72),
        "Resume: built a React and Python app with Git and automated testing.",
    )
    content = document.tobytes()
    document.close()
    response = client.post(
        "/api/resume/parse",
        files={"file": ("resume.pdf", content, "application/pdf")},
    )
    assert response.status_code == 200
    assert "React" in response.json()["text"]


def test_pdf_without_selectable_text_has_helpful_error() -> None:
    import fitz

    document = fitz.open()
    document.new_page()
    content = document.tobytes()
    document.close()
    response = client.post(
        "/api/resume/parse",
        files={"file": ("scanned.pdf", content, "application/pdf")},
    )
    assert response.status_code == 422
    assert "scanned/image-only PDF" in response.json()["error"]["message"]
