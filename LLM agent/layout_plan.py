"""Structured layout plan (v1): JSON schema, Gemini response parsing, allowlist validation."""

from __future__ import annotations

import json
import logging
import os
import re
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

logger = logging.getLogger(__name__)

ALLOWED_THEME_KEYS: frozenset[str] = frozenset(
    {
        "heading.h1",
        "heading.h2",
        "heading.h3",
        "profileCard.name",
        "profileCard.title",
        "profileCard.body",
    }
)

LAYOUT_PLAN_SYSTEM = """You are a layout planner for an internal component catalog admin UI.

Output ONLY a single JSON object. No markdown fences, no backticks, no HTML, no commentary.

Required shape:
{
  "version": 1,
  "blocks": [ ... ]
}

Block types (use "type" exactly):

1) Page heading (optional but use when the user wants a title and/or subtitle):
{ "type": "chrome", "kind": "pageHeading", "title": "<short title text>",
  "subtitle": "<optional subtitle>",
  "titleThemeKey": "heading.h2",
  "subtitleThemeKey": "profileCard.title" }

Allowed titleThemeKey and subtitleThemeKey values ONLY:
heading.h1, heading.h2, heading.h3, profileCard.name, profileCard.title, profileCard.body

2) Catalog component instances (repeat published preview HTML):
{ "type": "catalog", "ref": "<must be one of the allowed catalog refs below>",
  "repeat": 1,
  "layout": "flow",
  "grid": null }
or for a grid:
{ "type": "catalog", "ref": "<ref>", "repeat": 6, "layout": "grid", "grid": { "cols": 3, "rows": 2 } }

Rules:
- "repeat" for flow: how many copies in a row/wrap layout (1–12). For grid, repeat should equal cols*rows.
- ref must match the allowlist (case-insensitive; kebab-case or PascalCase+Component allowed).
- ORDER IS CRITICAL: The "blocks" array is rendered top-to-bottom in that exact sequence. Match the user's composition intent:
  - If they ask for title/subtitle first, then a component → put pageHeading chrome first, then catalog block(s).
  - If they ask for a component/card first, then title/subtitle → put catalog block(s) first, then pageHeading chrome.
  - If they list multiple sections in order, interleave chrome and catalog blocks to mirror that order.
- Use pageHeading chrome when the user wants a visible title and/or subtitle (extract copy from their words when possible).
"""


class GridModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    cols: int = Field(ge=1, le=6)
    rows: int = Field(ge=1, le=6)


class ChromeBlockModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["chrome"] = "chrome"
    kind: Literal["pageHeading"] = "pageHeading"
    title: str = Field(default="", max_length=500)
    subtitle: str | None = Field(default=None, max_length=500)
    titleThemeKey: str = Field(default="heading.h2", max_length=64)
    subtitleThemeKey: str | None = Field(default="profileCard.title", max_length=64)


class CatalogBlockModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    type: Literal["catalog"] = "catalog"
    ref: str = Field(..., min_length=1, max_length=256)
    repeat: int = Field(default=1, ge=1, le=36)
    layout: Literal["flow", "grid"] = "flow"
    grid: GridModel | None = None

    @model_validator(mode="after")
    def grid_flow_consistency(self) -> CatalogBlockModel:
        if self.layout == "grid" and self.grid is None:
            return self.model_copy(update={"grid": GridModel(cols=1, rows=1)})
        if self.layout == "flow":
            return self.model_copy(update={"grid": None})
        return self


class LayoutPlanV1Model(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: Literal[1] = 1
    blocks: list[ChromeBlockModel | CatalogBlockModel]


def theme_guide_path_default() -> str:
    override = os.environ.get("THEME_GUIDE_PATH", "").strip()
    if override:
        return os.path.abspath(os.path.expanduser(override))
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, "..", "src", "config", "theme-guide.json"))


def load_theme_guide_snippet(max_chars: int = 6000) -> str:
    path = theme_guide_path_default()
    try:
        with open(path, encoding="utf-8") as f:
            raw = f.read()
    except OSError as e:
        logger.warning("Could not read theme guide at %s: %s", path, e)
        return "(theme guide not available on server)"
    if len(raw) <= max_chars:
        return raw
    return raw[:max_chars] + "\n... (truncated)"


def extract_json_object(text: str) -> dict[str, Any]:
    t = text.strip()
    if t.startswith("```"):
        lines = t.split("\n")
        if lines and lines[0].strip().startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        t = "\n".join(lines).strip()
    m = re.search(r"\{[\s\S]*\}\s*$", t)
    if m:
        t = m.group(0)
    obj = json.loads(t)
    if not isinstance(obj, dict):
        raise ValueError("JSON root must be an object")
    return obj


def _norm_ref(s: str) -> str:
    return s.strip().lower().replace("_", "-").replace(" ", "")


def _to_kebab_guess(s: str) -> str:
    """Rough PascalCase / camelCase → kebab-case for matching."""
    t = s.strip().replace("_", "-").replace(" ", "-")
    t = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", t)
    return t.lower()


def _root_kebab(s: str) -> str:
    """Kebab id with trailing -component removed (e.g. case-card-component → case-card)."""
    k = _norm_ref(_to_kebab_guess(s))
    if k.endswith("-component"):
        k = k[: -len("-component")]
    return k


def match_catalog_ref(ref: str, allowlist: list[str]) -> str | None:
    """Return the allowlist entry that matches ref, or None."""
    if not ref.strip():
        return None
    r = _norm_ref(ref)
    r_kebab = _norm_ref(_to_kebab_guess(ref))
    r_root = _root_kebab(ref)
    for a in allowlist:
        if not a or not str(a).strip():
            continue
        raw = str(a).strip()
        a_n = _norm_ref(raw)
        a_kebab = _norm_ref(_to_kebab_guess(raw))
        a_root = _root_kebab(raw)
        if r == a_n or r_kebab == a_kebab or r_root == a_root:
            return raw
        if r_root and (r_root in a_kebab or a_kebab in r_root or r_root in a_root):
            return raw
        if r_kebab and (r_kebab in a_kebab or a_kebab in r_kebab):
            return raw
        if r and (r in a_n or a_n in r):
            return raw
    return None


def _coerce_theme_key(key: str | None, default: str) -> str:
    if not key or key not in ALLOWED_THEME_KEYS:
        return default
    return key


def sanitize_plan(plan: LayoutPlanV1Model, allowlist: list[str]) -> LayoutPlanV1Model:
    out_blocks: list[ChromeBlockModel | CatalogBlockModel] = []
    for b in plan.blocks:
        if isinstance(b, ChromeBlockModel):
            tk = _coerce_theme_key(b.titleThemeKey, "heading.h2")
            sk = b.subtitleThemeKey
            if sk is not None and sk not in ALLOWED_THEME_KEYS:
                sk = "profileCard.title"
            out_blocks.append(
                ChromeBlockModel(
                    type="chrome",
                    kind="pageHeading",
                    title=b.title,
                    subtitle=b.subtitle,
                    titleThemeKey=tk,
                    subtitleThemeKey=sk,
                )
            )
        else:
            canon = match_catalog_ref(b.ref, allowlist)
            if canon is None:
                logger.info("Dropping catalog block: ref %r not in allowlist", b.ref)
                continue
            layout = b.layout
            grid = b.grid
            if layout == "grid" and grid is not None:
                cells = min(36, max(1, grid.cols * grid.rows))
                repeat = cells
            else:
                repeat = min(12, max(1, b.repeat))
            out_blocks.append(
                CatalogBlockModel(
                    type="catalog",
                    ref=canon,
                    repeat=repeat,
                    layout=layout,
                    grid=grid,
                )
            )
    return LayoutPlanV1Model(version=1, blocks=out_blocks)


def parse_and_validate_plan(
    raw_text: str, allowlist: list[str]
) -> LayoutPlanV1Model:
    obj = extract_json_object(raw_text)
    plan = LayoutPlanV1Model.model_validate(obj)
    cleaned = sanitize_plan(plan, allowlist)
    if not cleaned.blocks:
        raise ValueError("No valid blocks after validation (check catalog allowlist and theme keys)")
    return cleaned


class PlanRequestBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prompt: str = Field(..., min_length=1, max_length=32000)
    catalogAllowlist: list[str] = Field(default_factory=list, max_length=2000)
