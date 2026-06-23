"""Catalog blueprint excerpts for rule-based and vector retrieval."""

from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

_CATALOG_CACHE: list["CatalogRecord"] | None = None
_HTML_EXCERPT_MAX = 2000


@dataclass(frozen=True)
class CatalogRecord:
    record_id: str
    label: str
    html_excerpt: str
    kind: str
    search_text: str


def _repo_root() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, "..", ".."))


def catalog_json_path() -> str:
    override = os.environ.get("CATALOG_JSON_PATH", "").strip()
    if override:
        return os.path.abspath(os.path.expanduser(override))
    return os.path.join(_repo_root(), "public", "blueprints", "_catalog.json")


def _blueprint_path(rel: str) -> str:
    rel = rel.lstrip("/")
    if rel.startswith("blueprints/"):
        return os.path.join(_repo_root(), "public", rel)
    return os.path.join(_repo_root(), "public", rel)


def load_full_source_html(blueprint_path: str | None) -> str:
    """Full published HTML for injection (VS Code extension); never truncated."""
    if not blueprint_path:
        return ""
    path = _blueprint_path(blueprint_path)
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        logger.debug("Blueprint read failed %s: %s", path, e)
        return ""
    if not isinstance(data, dict):
        return ""
    inner = data.get("data")
    if isinstance(inner, dict) and isinstance(inner.get("sourceHtml"), str):
        return inner["sourceHtml"].strip()
    return ""


def _load_source_html(blueprint_path: str | None) -> str:
    html = load_full_source_html(blueprint_path)
    if len(html) > _HTML_EXCERPT_MAX:
        return html[:_HTML_EXCERPT_MAX] + "\n... (truncated)"
    return html


def load_catalog_records(force_reload: bool = False) -> list[CatalogRecord]:
    global _CATALOG_CACHE
    if _CATALOG_CACHE is not None and not force_reload:
        return _CATALOG_CACHE

    path = catalog_json_path()
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except OSError as e:
        logger.warning("Could not read catalog at %s: %s", path, e)
        _CATALOG_CACHE = []
        return _CATALOG_CACHE

    components = data.get("components") if isinstance(data, dict) else None
    if not isinstance(components, list):
        _CATALOG_CACHE = []
        return _CATALOG_CACHE

    records: list[CatalogRecord] = []
    for item in components:
        if not isinstance(item, dict):
            continue
        rid = str(item.get("id", "")).strip()
        if not rid:
            continue
        import_id = str(item.get("importId", "")).strip()
        kind = str(item.get("kind", "component")).strip()
        label = import_id or rid
        bp = item.get("blueprintPath")
        bp_str = str(bp).strip() if bp else ""
        html = _load_source_html(bp_str)
        search_text = f"{rid} {import_id} {kind} {html[:500]}".lower()
        records.append(
            CatalogRecord(
                record_id=rid,
                label=label,
                html_excerpt=html,
                kind=kind,
                search_text=search_text,
            ),
        )

    _CATALOG_CACHE = records
    return records


_TOKEN_RE = re.compile(r"[a-z0-9][a-z0-9-]{1,}")


def retrieve_catalog_by_keywords(
    prompt: str,
    *,
    top_k: int = 2,
) -> list[CatalogRecord]:
    tokens = {t for t in _TOKEN_RE.findall(prompt.lower()) if len(t) >= 3}
    if not tokens:
        return []
    scored: list[tuple[int, CatalogRecord]] = []
    for rec in load_catalog_records():
        hits = sum(1 for t in tokens if t in rec.search_text)
        if hits > 0:
            scored.append((hits, rec))
    scored.sort(key=lambda x: (-x[0], x[1].record_id))
    return [r for _, r in scored[:top_k]]


def wants_similarity_search(prompt: str) -> bool:
    p = prompt.lower()
    return bool(
        re.search(
            r"\b(like|similar|same as|match|copy style of|based on)\b",
            p,
        ),
    )


def format_catalog_excerpts_block(records: list[CatalogRecord]) -> str:
    if not records:
        return ""
    lines = [
        "Published catalog HTML (retrieved reference — adapt to brand tokens; do not paste verbatim if it conflicts with token rules):",
    ]
    for rec in records:
        lines.append(f"- id={rec.record_id} kind={rec.kind} label={rec.label}")
        if rec.html_excerpt:
            lines.append(rec.html_excerpt)
        else:
            lines.append("(no sourceHtml excerpt)")
    return "\n".join(lines)
