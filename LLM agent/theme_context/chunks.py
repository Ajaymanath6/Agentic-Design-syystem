"""Load and split theme-guide.json into retrievable chunks."""

from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from typing import Any

from theme_context.file_loaders import theme_guide_path_default

logger = logging.getLogger(__name__)

_chunks_cache: list["ThemeChunk"] | None = None


@dataclass(frozen=True)
class ThemeChunk:
    chunk_id: str
    text: str
    keywords: frozenset[str]


def _flatten_json(obj: Any, prefix: str = "") -> list[tuple[str, Any]]:
    if isinstance(obj, dict):
        out: list[tuple[str, Any]] = []
        for k, v in obj.items():
            path = f"{prefix}.{k}" if prefix else k
            out.extend(_flatten_json(v, path))
        return out
    if isinstance(obj, list) and prefix:
        return [(prefix, obj)]
    if prefix:
        return [(prefix, obj)]
    return []


def _keywords_for_path(path: str) -> frozenset[str]:
    base = set(path.lower().replace(".", " ").split())
    extras: set[str] = set()
    p = path.lower()
    if "button" in p or "primary" in p or "secondary" in p or "neutral" in p:
        extras.update(
            {"button", "primary", "secondary", "neutral", "cta", "click", "submit"},
        )
    if "card" in p:
        extras.update({"card", "panel", "surface", "tile"})
    if "sidebar" in p or "productsidebar" in p:
        extras.update({"sidebar", "nav", "navigation", "menu", "productsidebar"})
    if "spacing" in p:
        extras.update(
            {
                "spacing",
                "gap",
                "padding",
                "margin",
                "micro",
                "tight",
                "cozy",
                "section",
                "hero",
                "inline",
            },
        )
    if "icon" in p:
        extras.update({"icon", "remix", "ri-"})
    if "aiinstructions" in p or "critical" in p:
        extras.update({"rule", "critical", "must", "never", "token"})
    if "layout" in p:
        extras.update({"layout", "row", "column", "split", "grid", "form"})
    if "typography" in p or "heading" in p or "font" in p:
        extras.update({"typography", "heading", "title", "font", "text"})
    if "shadow" in p:
        extras.update({"shadow", "elevation"})
    return frozenset(base | extras)


def _chunk_text(path: str, value: Any) -> str:
    try:
        body = json.dumps({path: value}, indent=2, ensure_ascii=False)
    except (TypeError, ValueError):
        body = str(value)
    return f'{{"chunkId":"{path}"}}\n{body}'


def load_theme_chunks(force_reload: bool = False) -> list[ThemeChunk]:
    global _chunks_cache
    if _chunks_cache is not None and not force_reload:
        return _chunks_cache

    path = theme_guide_path_default()
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except OSError as e:
        logger.warning("Could not read theme guide at %s: %s", path, e)
        _chunks_cache = []
        return _chunks_cache

    chunks: list[ThemeChunk] = []
    for sub_path, value in _flatten_json(data):
        if value is None:
            continue
        if isinstance(value, (str, int, float, bool)):
            text = _chunk_text(sub_path, value)
        elif isinstance(value, (dict, list)):
            text = _chunk_text(sub_path, value)
        else:
            continue
        if len(text) < 20:
            continue
        chunks.append(
            ThemeChunk(
                chunk_id=sub_path,
                text=text,
                keywords=_keywords_for_path(sub_path),
            ),
        )

    _chunks_cache = chunks
    return chunks


def critical_rules_chunk() -> ThemeChunk | None:
    for c in load_theme_chunks():
        if c.chunk_id == "aiInstructions.criticalRules":
            return c
    return None
