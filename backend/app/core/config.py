from __future__ import annotations

import os

DEFAULT_MAX_UPLOAD_BYTES = 5 * 1024 * 1024
MAX_TEXT_CHARS = 80_000
MIN_TEXT_CHARS = 40


def frontend_origins() -> list[str]:
    raw = os.getenv(
        "FRONTEND_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    )
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def max_upload_bytes() -> int:
    try:
        return max(1, int(os.getenv("MAX_UPLOAD_BYTES", str(DEFAULT_MAX_UPLOAD_BYTES))))
    except ValueError:
        return DEFAULT_MAX_UPLOAD_BYTES
