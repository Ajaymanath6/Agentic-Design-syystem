"""VS Code extension bridge: catalog sourceHtml lookup for POST /generate-code."""

from __future__ import annotations

import json
import logging
import re
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from theme_context.catalog_index import (
    _blueprint_path,
    catalog_json_path,
    load_full_source_html,
)

logger = logging.getLogger(__name__)

_COMPONENT_SUFFIX = "component"
_WHITESPACE_RE = re.compile(r"\s")


class GenerateCodeBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prompt: str = Field(..., max_length=32000)
    blueprintId: str | None = Field(default=None, max_length=512)


@dataclass(frozen=True)
class CatalogNameMatch:
    catalog_id: str
    display_name: str
    blueprint_path: str


class AmbiguousCatalogNameError(Exception):
    """Multiple catalog entries share the same normalized display name."""

    def __init__(self, name: str, matches: list[CatalogNameMatch]) -> None:
        self.name = name
        self.matches = matches
        super().__init__(name)


def norm_ref(s: str) -> str:
    """Mirror src/lib/layout-plan-catalog.ts normRef."""
    return (
        s.strip()
        .lower()
        .replace("_", "-")
        .replace(" ", "")
    )


def norm_display_name(s: str) -> str:
    """Normalized publish label (imageAlt) for exact name lookup."""
    return norm_ref(s)


def strip_component_suffix(s: str) -> str:
    """Mirror src/lib/layout-plan-catalog.ts stripComponentSuffix."""
    low = s.lower()
    if low.endswith(_COMPONENT_SUFFIX):
        return s[: -len(_COMPONENT_SUFFIX)].rstrip("-")
    return s


def _refs_match(canonical_ref: str, candidate: str) -> bool:
    r = norm_ref(canonical_ref)
    r_base = strip_component_suffix(r)
    a = norm_ref(candidate)
    a_base = strip_component_suffix(a)
    if r == a or r_base == a_base:
        return True
    if r_base and (r_base in a or a in r_base):
        return True
    if r and (r in a or a in r):
        return True
    return False


def _load_catalog_components() -> list[dict[str, Any]]:
    path = catalog_json_path()
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError) as e:
        logger.warning("Could not read catalog at %s: %s", path, e)
        return []
    components = data.get("components") if isinstance(data, dict) else None
    if not isinstance(components, list):
        return []
    return [c for c in components if isinstance(c, dict)]


def load_blueprint_meta(blueprint_path: str) -> dict[str, str]:
    """Read id, component, and publish label (imageAlt) from a blueprint file."""
    path = _blueprint_path(blueprint_path)
    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except (OSError, json.JSONDecodeError):
        return {"id": "", "component": "", "imageAlt": ""}
    if not isinstance(data, dict):
        return {"id": "", "component": "", "imageAlt": ""}
    inner = data.get("data")
    image_alt = ""
    if isinstance(inner, dict) and isinstance(inner.get("imageAlt"), str):
        image_alt = inner["imageAlt"].strip()
    comp = data.get("component")
    return {
        "id": str(data.get("id", "")).strip(),
        "component": str(comp).strip() if comp is not None else "",
        "imageAlt": image_alt,
    }


def find_catalog_entries_by_display_name(name: str) -> list[CatalogNameMatch]:
    """Catalog rows whose normalized imageAlt equals the normalized user name."""
    target = norm_display_name(name)
    if not target:
        return []

    matches: list[CatalogNameMatch] = []
    for item in _load_catalog_components():
        rid = str(item.get("id", "")).strip()
        bp_path = str(item.get("blueprintPath", "")).strip()
        if not rid or not bp_path:
            continue
        meta = load_blueprint_meta(bp_path)
        display_name = meta.get("imageAlt", "")
        if not display_name:
            continue
        if norm_display_name(display_name) == target:
            matches.append(
                CatalogNameMatch(
                    catalog_id=rid,
                    display_name=display_name,
                    blueprint_path=bp_path,
                ),
            )
    return matches


def resolve_catalog_ref(ref: str) -> str | None:
    """
    Match catalog entry by id, importId, or blueprint component (findCardByPlanRef rules).
    Returns full sourceHtml or None.
    """
    trimmed = ref.strip()
    if not trimmed:
        return None

    for item in _load_catalog_components():
        rid = str(item.get("id", "")).strip()
        import_id = str(item.get("importId", "")).strip()
        bp_path = str(item.get("blueprintPath", "")).strip()
        meta = load_blueprint_meta(bp_path) if bp_path else {"component": ""}
        component = meta.get("component", "")
        candidates = [c for c in (rid, import_id, component) if c]
        for candidate in candidates:
            if _refs_match(trimmed, candidate):
                html = load_full_source_html(bp_path)
                if html:
                    return html
                logger.warning(
                    "Catalog match %s but empty sourceHtml at %s",
                    rid,
                    bp_path,
                )
                return None
    return None


def resolve_catalog_by_display_name(name: str) -> str | None:
    """
    Match published component label (blueprint data.imageAlt).
    Raises AmbiguousCatalogNameError when multiple entries share the same name.
    """
    matches = find_catalog_entries_by_display_name(name)
    if not matches:
        return None
    if len(matches) > 1:
        raise AmbiguousCatalogNameError(name, matches)
    html = load_full_source_html(matches[0].blueprint_path)
    return html or None


def resolve_catalog_prompt(ref: str) -> str | None:
    """Id/importId lookup, then published display name (imageAlt)."""
    html = resolve_catalog_ref(ref)
    if html:
        return html
    return resolve_catalog_by_display_name(ref)


def list_catalog_display_names() -> list[str]:
    """Unique non-empty publish labels for 404 hints."""
    seen: set[str] = set()
    names: list[str] = []
    for item in _load_catalog_components():
        bp_path = str(item.get("blueprintPath", "")).strip()
        if not bp_path:
            continue
        meta = load_blueprint_meta(bp_path)
        label = meta.get("imageAlt", "").strip()
        if not label or label in seen:
            continue
        seen.add(label)
        names.append(label)
    return sorted(names, key=lambda s: s.lower())


def is_catalog_fast_path(body: GenerateCodeBody, prompt: str) -> bool:
    """Extension sends blueprintId when prompt has no whitespace."""
    if body.blueprintId is not None and body.blueprintId.strip():
        return True
    return bool(prompt) and _WHITESPACE_RE.search(prompt) is None


def catalog_lookup_ref(body: GenerateCodeBody, prompt: str) -> str:
    if body.blueprintId and body.blueprintId.strip():
        return body.blueprintId.strip()
    return prompt
