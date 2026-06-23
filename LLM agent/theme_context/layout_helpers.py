"""Layout plan prompt helpers (allowlist trim, layout chunks)."""

from __future__ import annotations

import re

from theme_context.catalog_index import retrieve_catalog_by_keywords
from theme_context.chunks import ThemeChunk, load_theme_chunks
from theme_context.config import layout_allowlist_prompt_max
from theme_context.rule_retriever import _prompt_tokens, score_chunk

_TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9-]{2,}")


def score_allowlist_entry(entry: str, tokens: set[str]) -> float:
    el = entry.lower()
    hits = sum(1 for t in tokens if t in el)
    return float(hits)


def trim_allowlist_for_prompt(
    allowlist: list[str],
    prompt: str,
    *,
    max_entries: int | None = None,
) -> tuple[list[str], bool]:
    """
    Returns (entries_for_prompt, was_trimmed).
    Full allowlist must still be used for validation.
    """
    cap = max_entries if max_entries is not None else layout_allowlist_prompt_max()
    cleaned = [a for a in allowlist if str(a).strip()]
    if len(cleaned) <= cap:
        return cleaned, False

    tokens = _prompt_tokens(prompt)
    if not tokens:
        return cleaned[:cap], True

    scored = [(score_allowlist_entry(a, tokens), a) for a in cleaned]
    scored.sort(key=lambda x: (-x[0], x[1]))
    top = [a for _, a in scored[:cap]]
    return top, True


def retrieve_layout_chunks(prompt: str) -> list[ThemeChunk]:
    tokens = _prompt_tokens(prompt)
    layout_keywords = frozenset(
        {
            "layout",
            "row",
            "column",
            "split",
            "sidebar",
            "grid",
            "form",
            "stack",
            "side",
            "horizontal",
        },
    )
    if not (tokens & layout_keywords):
        return []

    selected_sorted: list[tuple[float, ThemeChunk]] = []
    for chunk in load_theme_chunks():
        cid = chunk.chunk_id.lower()
        if "layout" in cid or cid.startswith("spacing."):
            s = score_chunk(chunk, tokens)
            if s > 0:
                selected_sorted.append((s, chunk))

    selected_sorted.sort(key=lambda x: (-x[0], x[1].chunk_id))
    return [c for _, c in selected_sorted[:2]]


def format_allowlist_note(was_trimmed: bool, shown: int, total: int) -> str:
    if not was_trimmed:
        return ""
    return (
        f"(Showing top {shown} of {total} catalog refs by prompt relevance; "
        "validation still accepts the full allowlist sent by the client.)"
    )
