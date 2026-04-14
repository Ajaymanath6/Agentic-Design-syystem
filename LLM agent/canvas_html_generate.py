"""Components canvas HTML creator: Vertex returns a single HTML fragment (not JSON plan)."""

from __future__ import annotations

import logging
import re
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from canvas_plan import (
    CanvasPlanChatMessage,
    CanvasPlanPromptBody,
    TAILWIND_BRAND_CONTRACT,
    _format_conversation_block,
    _normalize_chat_messages,
    format_canvas_references_block,
)
from layout_plan import load_tailwind_config_snippet, load_theme_guide_snippet

logger = logging.getLogger(__name__)

MAX_HTML_OUTPUT_CHARS = 16_000
MAX_HTML_TITLE_CHARS = 200

CANVAS_HTML_CREATOR_SYSTEM = """You are an expert front-end developer for an internal **design-system admin** app.

Output **ONLY** a single self-contained **HTML fragment** (no DOCTYPE, no <html>, no <head>, no <body> wrapper).
No markdown code fences, no backticks, no commentary before or after the HTML.

**Styling**
- Use **Tailwind CSS utility classes** that match this project's design tokens: prefer `brandcolor-*` colors
  (e.g. text-brandcolor-textstrong, text-brandcolor-textweak, bg-brandcolor-white, bg-brandcolor-fill,
  border-brandcolor-strokeweak, bg-brandcolor-primary, rounded-lg, shadow-card) and spacing from the theme.
- Reuse patterns from the theme guide when applicable (card-like surfaces: rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white).
- Do **not** use arbitrary hex colors in `class` attributes; stick to the token names above.

**Icons (HTML fragments only)**
- The host page loads **Remix Icon webfont** CSS. For notification, close, chevron, etc., use `<i class="ri-notification-line">` (or `-fill`) with class names from https://remixicon.com — same names as @remixicon/react but with `ri-` kebab-case and `-line`/`-fill` suffix.
- Put Tailwind sizing/color on that `<i>` (e.g. `class="ri-notification-line size-5 text-brandcolor-textstrong"`). Do **not** rely on @remixicon/react in raw HTML.

**Safety (mandatory)**
- Do **not** include <script>, <style> (except inline on elements is discouraged — prefer classes), <iframe>, <object>, <embed>, or event handler attributes (no onclick=, onload=, etc.).
- Do **not** use javascript: URLs.
- Use semantic tags where natural (section, article, button, h1–h3, p, img with alt text if you include an image placeholder).

**Scope**
- One cohesive UI block (e.g. a card, a small form row, a profile strip) — not a full page.
- Keep the fragment reasonably small (under ~12k characters).

If a conversation history is included, use it only for context; generate HTML for the **latest** user request below.
"""


_FENCE_RE = re.compile(
    r"```(?:html|HTML)?\s*\n(.*?)```",
    re.DOTALL,
)

_SCRIPT_RE = re.compile(
    r"<\s*script\b[^>]*>.*?</\s*script\s*>",
    re.IGNORECASE | re.DOTALL,
)


class CanvasHtmlGenerateResult(BaseModel):
    """Validated payload returned to the browser."""

    model_config = ConfigDict(extra="forbid")

    html: str = Field(..., min_length=1, max_length=MAX_HTML_OUTPUT_CHARS)
    title: str = Field(..., min_length=1, max_length=MAX_HTML_TITLE_CHARS)


def strip_markdown_fences(raw: str) -> str:
    """If the model wrapped HTML in ``` fences, extract the first fenced block."""
    text = raw.strip()
    m = _FENCE_RE.search(text)
    if m:
        return m.group(1).strip()
    # Leading fence only (no closing)
    if text.startswith("```"):
        lines = text.split("\n")
        if lines and lines[0].strip().startswith("```"):
            lines = lines[1:]
        while lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        return "\n".join(lines).strip()
    return text


def _strip_scripts(html: str) -> str:
    return _SCRIPT_RE.sub("", html)


def _title_from_prompt(prompt: str) -> str:
    """
    Short catalog-style title for htmlSnippet / publish modal.
    Heuristics aligned with client `coerceCanvasControlLabel` (named phrase, quoted, first sentence, word cut).
    """
    t = " ".join(prompt.strip().split())
    if not t:
        return "HTML block"
    soft = 56
    max_ch = MAX_HTML_TITLE_CHARS
    if len(t) <= soft:
        return t[:max_ch]

    m = re.search(
        r'(?:name|naem|call|label)\s+it\s+["\']?([^"\'\n,.;]{2,56})',
        t,
        re.IGNORECASE,
    )
    if m:
        return m.group(1).strip()[:max_ch]

    m2 = re.search(
        r'(?:^|[\s,])(?:label|title|text)\s*(?:is|=|:)\s*["\']?([^"\'\n,.;]{2,56})',
        t,
        re.IGNORECASE,
    )
    if m2:
        return m2.group(1).strip()[:max_ch]

    mq = re.search(r'["\']([^"\'\n]{2,48})["\']', t)
    if mq:
        return mq.group(1).strip()[:max_ch]

    parts = re.split(r"[.?!]\s+", t)
    first_sentence = parts[0].strip() if parts else t
    if (
        len(first_sentence) >= 2
        and len(first_sentence) < len(t)
        and len(first_sentence) <= soft + 12
    ):
        return first_sentence[:max_ch]

    cut = t[:soft].strip()
    last_space = cut.rfind(" ")
    wordish = cut[:last_space] if last_space > 20 else cut
    out = f"{wordish}…"
    return out[:max_ch]


def normalize_model_html(raw: str, title: str) -> str:
    """
    Strip fences, remove script tags, enforce max length.
    Raises ValueError if result is empty or clearly not HTML.
    """
    html = strip_markdown_fences(raw)
    html = _strip_scripts(html)
    html = html.strip()
    if not html:
        raise ValueError("Model returned empty HTML after stripping")
    if "<" not in html:
        raise ValueError("Model response does not look like HTML (no tags)")
    if re.search(r"<\s*script\b", html, re.IGNORECASE):
        raise ValueError("HTML contains disallowed script tags")
    if len(html) > MAX_HTML_OUTPUT_CHARS:
        logger.warning("Truncating HTML from %s to %s chars", len(html), MAX_HTML_OUTPUT_CHARS)
        html = html[:MAX_HTML_OUTPUT_CHARS]
    return html


def build_canvas_html_contents(body: CanvasPlanPromptBody) -> str:
    """Full prompt string for generate_content (same body shape as /canvas/plan)."""
    theme_max = 12000 if body.extended_design_context else 6000
    theme_snippet = load_theme_guide_snippet(theme_max)

    parts: list[str] = [
        CANVAS_HTML_CREATOR_SYSTEM,
        TAILWIND_BRAND_CONTRACT.strip(),
        "Theme guide JSON (reference for surfaces and typography):",
        theme_snippet,
    ]

    if body.extended_design_context:
        tw = load_tailwind_config_snippet(10000)
        parts.extend(
            [
                "Tailwind config (reference; truncated if huge):",
                tw,
            ]
        )

    history = _normalize_chat_messages(body.messages)
    if history:
        parts.append(_format_conversation_block(history))

    if body.canvas_references:
        ref_block = format_canvas_references_block(body.canvas_references)
        if ref_block:
            parts.append(ref_block)

    parts.extend(
        [
            "Latest user request (generate one HTML fragment for this):",
            body.prompt.strip(),
        ]
    )

    return "\n\n".join(parts)


def parse_html_generate_response(raw_text: str, prompt: str) -> dict[str, Any]:
    """Turn model text into { html, title } for JSON response."""
    title = _title_from_prompt(prompt)
    html = normalize_model_html(raw_text, title)
    validated = CanvasHtmlGenerateResult(html=html, title=title)
    return {"html": validated.html, "title": validated.title}
