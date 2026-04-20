"""Layout workspace HTML creator: Vertex returns one HTML fragment (parallel to canvas HTML)."""

from __future__ import annotations

from canvas_plan import TAILWIND_BRAND_CONTRACT
from layout_plan import LayoutHtmlRequestBody, load_theme_guide_snippet, load_tailwind_config_snippet

LAYOUT_HTML_CREATOR_SYSTEM = """You are an expert front-end developer for an internal **design-system admin** app (layout workspace).

Output **ONLY** a single self-contained **HTML fragment** (no DOCTYPE, no <html>, no <head>, no <body> wrapper).
No markdown code fences, no backticks, no commentary before or after the HTML.

**Styling**
- Use **Tailwind CSS utility classes** that match this project's design tokens: prefer `brandcolor-*` colors
  (e.g. text-brandcolor-textstrong, text-brandcolor-textweak, bg-brandcolor-white, bg-brandcolor-fill,
  border-brandcolor-strokeweak, bg-brandcolor-primary, rounded-lg, shadow-card) and spacing from the theme.
- **Spacing tokens (mandatory for layout rhythm):** use theme.extend.spacing keys only — micro, tight, cozy, section, hero, inline
  as in gap-micro, p-cozy, px-section, space-x-micro, space-y-tight. For card shells described as compact/default/comfy padding,
  prefer p-card-pad-compact, p-card-pad-default, p-card-pad-comfy; inner card stacks: gap-card-gap-tight, gap-card-gap-default, gap-card-gap-loose.
  Wrong: gap-2, space-x-2, p-4, m-6 (default Tailwind scale) when the user asked for hairline/dense/cozy/section-style rhythm — those do not track :root --space-*.
- Reuse patterns from the theme guide when applicable (card-like surfaces: rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white).
- Do **not** use arbitrary hex colors in `class` attributes; stick to the token names above.

**Layout scope (broader than a single canvas card)**
- You may output a **page section**, **marketing block**, **admin shell region**, or **multi-region layout** (e.g. hero + grid, sidebar strip + content).
- Prefer **semantic structure** (section, header, main, nav, article) when it helps readability.
- Keep one cohesive fragment; avoid unrelated mini-pages stacked without connection.

**Icons (HTML fragments only)**
- The host page loads **Remix Icon webfont** CSS. Use `<i class="ri-notification-line">` (or `-fill`) with class names from https://remixicon.com.
- Put Tailwind sizing/color on that `<i>` (e.g. `class="ri-notification-line size-5 text-brandcolor-textstrong"`).

**Published catalog references**
- If **Published catalog HTML (reference only)** appears below, treat it as **inspiration and structure hints** for real components already in the system.
- Do **not** paste raw third-party markup verbatim if it conflicts with token rules; adapt styling to brand tokens.

**Safety (mandatory)**
- Do **not** include <script>, <style> (inline on elements is discouraged — prefer classes), <iframe>, <object>, <embed>, or event handler attributes (no onclick=, onload=, etc.).
- Do **not** use javascript: URLs.

**Size**
- Keep the fragment reasonably small (under ~12k characters).
"""


def _format_catalog_reference_blocks(body: LayoutHtmlRequestBody) -> str:
    blocks = body.catalogReferenceBlocks
    if not blocks:
        return ""
    lines: list[str] = [
        "Published catalog HTML (reference only — adapt to theme tokens; ids below are catalog entry ids):",
    ]
    for b in blocks:
        label = (b.label or "").strip() or b.id
        snippet = (b.htmlSnippet or "").strip()
        if not snippet:
            lines.append(f"- id={b.id!r} label={label!r} (no snippet)")
            continue
        lines.append(f"- id={b.id!r} label={label!r}")
        lines.append(snippet)
    return "\n".join(lines)


def build_layout_html_contents(body: LayoutHtmlRequestBody) -> str:
    """Full prompt string for generate_content."""
    theme_max = 12000 if body.extended_design_context else 6000
    theme_snippet = load_theme_guide_snippet(theme_max)

    allow_lines = "\n".join(
        f"- {a}" for a in body.catalogAllowlist[:800] if str(a).strip()
    )
    catalog_section = (
        allow_lines
        or "(no catalog ids sent — prefer theme-aligned generic layout)"
    )

    parts: list[str] = [
        LAYOUT_HTML_CREATOR_SYSTEM,
        TAILWIND_BRAND_CONTRACT.strip(),
        "Allowed catalog refs (prefer these names when embedding or describing components):",
        catalog_section,
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

    ref_block = _format_catalog_reference_blocks(body)
    if ref_block:
        parts.append(ref_block)

    parts.extend(
        [
            "Latest user request (generate one HTML fragment for this):",
            body.prompt.strip(),
        ]
    )

    return "\n\n".join(parts)
