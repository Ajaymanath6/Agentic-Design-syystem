"""Extract relevant tailwind.config.js sections for smart mode."""

from __future__ import annotations

import logging
import os
import re

from theme_context.file_loaders import load_tailwind_config_snippet, tailwind_config_path_default

logger = logging.getLogger(__name__)

_SECTION_MARKERS = (
    ("colors", re.compile(r"colors\s*:\s*\{", re.IGNORECASE)),
    ("spacing", re.compile(r"spacing\s*:\s*\{", re.IGNORECASE)),
    ("boxShadow", re.compile(r"boxShadow\s*:\s*\{", re.IGNORECASE)),
    ("fontSize", re.compile(r"fontSize\s*:\s*\{", re.IGNORECASE)),
    ("fontFamily", re.compile(r"fontFamily\s*:\s*\{", re.IGNORECASE)),
)


def _extract_braced_block(text: str, start: int) -> str:
    depth = 0
    i = start
    while i < len(text):
        c = text[i]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[start : i + 1]
        i += 1
    return text[start : min(start + 4000, len(text))]


def filter_tailwind_config_snippet(max_chars: int = 10000) -> str:
    path = tailwind_config_path_default()
    try:
        with open(path, encoding="utf-8") as f:
            raw = f.read()
    except OSError as e:
        logger.warning("Could not read tailwind config at %s: %s", path, e)
        return "(tailwind.config.js not available on server)"

    extend_match = re.search(r"extend\s*:\s*\{", raw)
    if not extend_match:
        return load_tailwind_config_snippet(max_chars)

    extend_start = extend_match.end() - 1
    extend_block = _extract_braced_block(raw, extend_start)
    parts: list[str] = ["theme.extend excerpts (filtered for LLM context):"]
    for name, pattern in _SECTION_MARKERS:
        m = pattern.search(extend_block)
        if not m:
            continue
        block_start = extend_block.rfind("{", 0, m.end())
        if block_start < 0:
            block_start = m.start()
        section = _extract_braced_block(extend_block, block_start)
        parts.append(f"/* {name} */")
        parts.append(f"{name}: {section}")

    if len(parts) <= 1:
        return load_tailwind_config_snippet(max_chars)

    text = "\n".join(parts)
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 30].rstrip() + "\n... (truncated)"
