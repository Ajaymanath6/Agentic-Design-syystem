"""Layout workspace HTML creator: Vertex returns one HTML fragment (parallel to canvas HTML)."""

from __future__ import annotations

from canvas_plan import TAILWIND_BRAND_CONTRACT
from generative_spacing_intent import GENERATIVE_SPACING_INTENT_SECTION
from layout_plan import LayoutHtmlRequestBody
from theme_context.assembler import (
    assemble_theme_context,
    format_theme_context_for_prompt,
    load_tailwind_context_snippet,
)
from theme_context.models import snapshot_colors

LAYOUT_HTML_CREATOR_SYSTEM = """You are an expert front-end developer for an internal **design-system admin** app (layout workspace).

Output **ONLY** a single self-contained **HTML fragment** (no DOCTYPE, no <html>, no <head>, no <body> wrapper).
No markdown code fences, no backticks, no commentary before or after the HTML.

**Styling**
- Use **Tailwind CSS utility classes** that match this project's design tokens: prefer `brandcolor-*` colors
  (e.g. text-brandcolor-textstrong, text-brandcolor-textweak, bg-brandcolor-white, bg-brandcolor-fill,
  border-brandcolor-strokeweak, bg-brandcolor-primary, rounded-lg, shadow-card) and spacing from the theme when spacing is needed.
- **Spacing tokens (when you use padding/margin/gap):** use theme.extend.spacing keys only — micro, tight, cozy, section, hero, inline
  as in gap-micro, p-cozy, px-section, space-x-micro, space-y-tight. For card shells described as compact/default/comfy padding,
  prefer p-card-pad-compact, p-card-pad-default, p-card-pad-comfy; inner card stacks: gap-card-gap-tight, gap-card-gap-default, gap-card-gap-loose.
  Wrong: gap-2, space-x-2, p-4, m-6 (default Tailwind scale) when the user asked for hairline/dense/cozy/section-style rhythm — those do not track :root --space-*.
  Do **not** sprinkle `p-*` / `gap-*` on every region—only where the prompt implies inset, stacks, or card chrome (see Spacing intent below).
- **Single inset:** For a card, panel, or workspace block, put padding on **one** outer wrapper only; do **not** stack `p-*` / `px-*` / `py-*` on inner titles or labels unless the prompt asks for padding on that inner line.
- Reuse patterns from the theme guide when applicable (card-like surfaces: rounded-lg border border-brandcolor-strokeweak bg-brandcolor-white).
- Do **not** use arbitrary hex colors in `class` attributes; stick to the token names above.
""" + GENERATIVE_SPACING_INTENT_SECTION + """
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
    from theme_context.layout_helpers import (
        format_allowlist_note,
        trim_allowlist_for_prompt,
    )

    bundle = assemble_theme_context(
        body.prompt,
        extended=body.extended_design_context,
        theme_snapshot=snapshot_colors(body.theme_snapshot),
    )

    allow_for_prompt, trimmed = trim_allowlist_for_prompt(
        body.catalogAllowlist,
        body.prompt,
    )
    allow_lines = "\n".join(f"- {a}" for a in allow_for_prompt if str(a).strip())
    catalog_section = (
        allow_lines
        or "(no catalog ids sent — prefer theme-aligned generic layout)"
    )
    trim_note = format_allowlist_note(
        trimmed,
        len(allow_for_prompt),
        len([a for a in body.catalogAllowlist if str(a).strip()]),
    )

    parts: list[str] = [
        LAYOUT_HTML_CREATOR_SYSTEM,
        TAILWIND_BRAND_CONTRACT.strip(),
        "Allowed catalog refs (prefer these names when embedding or describing components):",
        catalog_section,
    ]
    if trim_note:
        parts.append(trim_note)
    parts.extend(
        format_theme_context_for_prompt(
            bundle,
            theme_heading="Theme guide JSON (reference for surfaces and typography):",
        ),
    )

    if body.extended_design_context:
        tw = load_tailwind_context_snippet(extended=True)
        if tw:
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
