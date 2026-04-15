"""Optional second Vertex pass: align HTML class spacing with theme tokens."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from canvas_html_generate import MAX_HTML_OUTPUT_CHARS, strip_markdown_fences
from layout_plan import extract_json_object

logger = logging.getLogger(__name__)

# Keep in sync with tailwind.config.js theme.extend.spacing.
_ALLOWED_KEYS_BLURB = """Allowed theme spacing keys (use in class utilities; map from user words like micro, cozy, tight):
- Primitives: micro, tight, cozy, section, hero, inline — prefix gap-, p-, px-, py-, m-, mt-, mb-, ml-, mr-, space-x-, space-y-, etc.
- Card aliases: card-pad-compact, card-pad-default, card-pad-comfy, card-gap-tight, card-gap-default, card-gap-loose."""

SPACING_FIX_SYSTEM = f"""You are a **spacing-only auditor** for one HTML fragment from a design-system admin app.

You receive (1) the latest user request text and (2) one HTML string. Output **ONLY** a single JSON object, no markdown fences, no commentary:
{{"html":"..."}}

{_ALLOWED_KEYS_BLURB}

Rules:
- Preserve the same overall DOM structure, tag names, nesting order, and element count. Change **only** `class` attribute values where needed for spacing alignment.
- When the user explicitly asks for a named step (micro, tight, cozy, section, hero, inline) or card padding/gap semantics (compact/default/comfy shell; tight/default/loose inner gaps), utilities must use those token names (e.g. gap-micro not gap-2; space-x-micro not space-x-2; p-cozy or p-card-pad-default instead of generic p-4 when the intent matches theme rhythm).
- If intent is **unclear** or a numeric utility is clearly intentional for a non-theme reason, **leave** classes unchanged.
- Never add or keep <script>, <style>, javascript: URLs, or event handler attributes (onclick=, etc.).
- The "html" string must remain a valid HTML fragment.

Output valid JSON only."""


_SCRIPT_RE = re.compile(
    r"<\s*script\b[^>]*>.*?</\s*script\s*>",
    re.IGNORECASE | re.DOTALL,
)


def build_spacing_fix_contents(prompt: str, html: str) -> str:
    return "\n\n".join(
        [
            SPACING_FIX_SYSTEM.strip(),
            "Latest user request:",
            prompt.strip(),
            "HTML fragment to audit (rewrite class spacing only if needed; return same structure under key html):",
            html,
        ]
    )


def parse_spacing_fix_json(raw: str, max_len: int = MAX_HTML_OUTPUT_CHARS) -> str | None:
    """
    Parse model JSON { "html": "..." }; strip scripts; enforce max length.
    Returns None on any failure (caller keeps pass-1 HTML).
    """
    try:
        text = strip_markdown_fences(raw.strip())
        obj: dict[str, Any] = extract_json_object(text)
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        logger.warning("spacing fix JSON parse failed: %s", e)
        return None
    html_out = obj.get("html")
    if not isinstance(html_out, str):
        return None
    html_out = html_out.strip()
    if not html_out or "<" not in html_out:
        return None
    html_out = _SCRIPT_RE.sub("", html_out)
    if re.search(r"<\s*script\b", html_out, re.IGNORECASE):
        return None
    if len(html_out) > max_len:
        logger.warning("spacing fix html exceeds max length %s", max_len)
        return None
    return html_out
