"""Keyword / overlap scoring for theme-guide chunks."""

from __future__ import annotations

import re

from theme_context.chunks import ThemeChunk, critical_rules_chunk, load_theme_chunks

_TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9-]{1,}")


def _prompt_tokens(prompt: str) -> set[str]:
    return {t for t in _TOKEN_RE.findall(prompt.lower()) if len(t) >= 2}


def score_chunk(chunk: ThemeChunk, tokens: set[str]) -> float:
    if not tokens:
        return 0.0
    kw = chunk.keywords
    overlap = len(tokens & kw)
    if overlap == 0:
        return 0.0
    return overlap / (len(kw) ** 0.5)


def retrieve_rule_chunks(
    prompt: str,
    *,
    top_k: int = 3,
    min_score: float = 0.35,
) -> list[ThemeChunk]:
    tokens = _prompt_tokens(prompt)
    scored: list[tuple[float, ThemeChunk]] = []
    for chunk in load_theme_chunks():
        if chunk.chunk_id == "aiInstructions.criticalRules":
            continue
        s = score_chunk(chunk, tokens)
        if s >= min_score:
            scored.append((s, chunk))
    scored.sort(key=lambda x: (-x[0], x[1].chunk_id))
    selected = [c for _, c in scored[:top_k]]
    critical = critical_rules_chunk()
    if critical and all(c.chunk_id != critical.chunk_id for c in selected):
        selected = [critical] + selected[: max(0, top_k)]
    return selected
