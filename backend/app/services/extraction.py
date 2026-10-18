from __future__ import annotations

import re
from functools import lru_cache

from app.models.skills import SKILL_CATALOG, SkillRule


def _alias_pattern(alias: str) -> re.Pattern[str]:
    escaped = re.escape(alias).replace(r"\ ", r"\s+").replace("/", r"\s*/\s*")
    left = r"(?<!\w)" if alias[0].isalnum() else ""
    right = r"(?!\w)" if alias[-1].isalnum() else ""
    return re.compile(left + escaped + right, re.IGNORECASE)


@lru_cache(maxsize=1)
def _compiled_catalog() -> tuple[tuple[SkillRule, tuple[re.Pattern[str], ...]], ...]:
    return tuple(
        (rule, tuple(_alias_pattern(alias) for alias in rule.aliases))
        for rule in SKILL_CATALOG
    )


def normalize_skill_mentions(text: str) -> list[str]:
    """Return catalog names in catalog order when any alias occurs as a token."""
    if not text or not text.strip():
        return []
    found: list[str] = []
    for rule, patterns in _compiled_catalog():
        if any(pattern.search(text) for pattern in patterns):
            found.append(rule.name)
    return found


def _sentence_evidence(text: str, patterns: tuple[re.Pattern[str], ...]) -> str | None:
    for sentence in re.split(r"(?<=[.!?;])\s+|\n+", text):
        candidate = " ".join(sentence.split()).strip()
        if candidate and any(pattern.search(candidate) for pattern in patterns):
            return candidate[:240] + ("…" if len(candidate) > 240 else "")
    return None


def extract_skill_evidence(text: str) -> dict[str, str | None]:
    """Map each detected canonical skill to a short matching sentence, if present."""
    if not text or not text.strip():
        return {}
    result: dict[str, str | None] = {}
    for rule, patterns in _compiled_catalog():
        if any(pattern.search(text) for pattern in patterns):
            result[rule.name] = _sentence_evidence(text, patterns)
    return result
