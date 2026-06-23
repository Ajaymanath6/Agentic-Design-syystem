"""Parse live brand colors from repo (and optional client snapshot)."""

from __future__ import annotations

import logging
import os
import re
from typing import Mapping

logger = logging.getLogger(__name__)

TS_START = "// @agentic-brand-colors-start"
TS_END = "// @agentic-brand-colors-end"
_HEX_LINE = re.compile(
    r"^\s*['\"]?(brandcolor-[a-z0-9-]+)['\"]?\s*:\s*['\"](#[0-9A-Fa-f]{6})['\"]",
    re.MULTILINE,
)


def brand_theme_colors_path_default() -> str:
    override = os.environ.get("BRAND_THEME_COLORS_PATH", "").strip()
    if override:
        return os.path.abspath(os.path.expanduser(override))
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(
        os.path.join(here, "..", "..", "src", "config", "brand-theme-colors.ts"),
    )


def parse_brand_colors_from_ts(path: str | None = None) -> dict[str, str]:
    p = path or brand_theme_colors_path_default()
    try:
        with open(p, encoding="utf-8") as f:
            raw = f.read()
    except OSError as e:
        logger.warning("Could not read brand colors at %s: %s", p, e)
        return {}

    start = raw.find(TS_START)
    end = raw.find(TS_END)
    if start < 0 or end < 0 or end <= start:
        logger.warning("Brand color markers missing in %s", p)
        return {}

    block = raw[start + len(TS_START) : end]
    out: dict[str, str] = {}
    for m in _HEX_LINE.finditer(block):
        out[m.group(1)] = m.group(2).upper()
    return out


def merge_palette(
    file_colors: dict[str, str],
    snapshot: Mapping[str, str] | None,
) -> dict[str, str]:
    merged = dict(file_colors)
    if not snapshot:
        return merged
    for key, hex_val in snapshot.items():
        if not isinstance(key, str) or not isinstance(hex_val, str):
            continue
        raw = hex_val.strip()
        with_hash = raw if raw.startswith("#") else f"#{raw}"
        if re.fullmatch(r"#[0-9A-Fa-f]{6}", with_hash):
            merged[key] = with_hash.upper()
    return merged


def format_palette_block(
    colors: dict[str, str],
    max_chars: int = 1200,
) -> str:
    if not colors:
        return (
            "Current brand palette: (unavailable — use brandcolor-* token class names; "
            "no raw hex in class attributes)."
        )
    lines = [
        "Current brand palette (from repo; use token class names in output, not raw hex in class):",
    ]
    for key in sorted(colors.keys()):
        lines.append(f"{key}: {colors[key]}")
    text = "\n".join(lines)
    if len(text) <= max_chars:
        return text
    truncated = text[: max_chars - 40].rstrip()
    return truncated + "\n... (palette truncated)"
