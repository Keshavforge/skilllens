from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.core.config import frontend_origins

app = FastAPI(
    title="SkillLens API",
    description=(
        "Explainable resume-to-job skill mention analysis. The score is a catalog coverage "
        "indicator, not a hiring probability."
    ),
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=frontend_origins(),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
app.include_router(router)

# In the container, the frontend build is copied beside the backend. Local API
# development remains independent when no production build is present.
frontend_dist = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "validation_error",
                "message": (
                    "Check the request fields. Resume and job-description text must each "
                    "contain at least 40 non-whitespace characters and stay under 80,000 characters."
                ),
            }
        },
    )


@app.exception_handler(HTTPException)
async def http_error_handler(request, exc: HTTPException) -> JSONResponse:
    message = exc.detail if isinstance(exc.detail, str) else "The request could not be completed."
    return JSONResponse(
        status_code=exc.status_code,
        headers=exc.headers,
        content={
            "error": {
                "code": f"http_{exc.status_code}",
                "message": message,
            }
        },
    )
