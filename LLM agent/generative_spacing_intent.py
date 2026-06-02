"""Shared prompt text: token-first spacing and surgical class edits for generative HTML (canvas + layout)."""

# Appended to CANVAS_HTML_CREATOR_SYSTEM and LAYOUT_HTML_CREATOR_SYSTEM — keep in sync with spacing pass.
GENERATIVE_SPACING_INTENT_SECTION = """
**Spacing intent (precise edits)**
- **No gratuitous spacing:** Do **not** add `p-*`, `m-*`, `gap-*`, `space-x-*`, `space-y-*`, or card pad/gap utilities unless the user prompt asks for spacing, padding, margins, gaps, density, or an explicitly padded card/panel/section. If the prompt is only about copy, colors, icons, or structure, **do not** introduce new spacing classes. Plain headings, labels (e.g. a "Workspace" title), toolbars, and single-line rows often need **no** `p-tight` / `p-cozy` — omit them unless the user requested padding or described inset for that region.
- **Token-first:** When the user names a rhythm (micro, tight, cozy, section, hero, inline) or card shells (p-card-pad-compact|default|comfy, gap-card-gap-tight|default|loose), map to **theme spacing utilities** (e.g. space-y-tight, gap-micro, px-section), not generic `p-4` / `gap-2` / `m-3`, unless they explicitly ask for arbitrary pixel spacing.
- **Surgical edits:** If they ask to change **only one edge or region** (e.g. remove bottom padding on the header; tighter vertical gap between nav items only), adjust **only** the relevant utilities on the right element (`pb-*`, `mb-*`, `pt-*`, `mt-*`, `space-y-*`, `gap-*`, or `last:` / `first:` variants). **Preserve** other padding and margin classes on siblings and ancestors unless the user asked to change those too. **Exception:** Removing redundant inner `p-*` / `px-*` / `py-*` when an outer shell already carries the inset (to fix **nested padding**) is still a **minimal, targeted** edit for that spacing goal—not “striking unrelated padding.”
- **Ambiguity:** Prefer **minimal** change over stripping every `p-*` on a container.
- **Nested padding compounds:** Parent `p-*` **adds** to child `p-*` in the layout—so total inset looks larger than either class alone. If you put or change padding on the **wrapper** the user meant (card, workspace block, section), **remove** redundant `p-*` / `px-*` / `py-*` on inner titles and labels (e.g. `<p class="p-tight">Workspace</p>` → keep typography classes, **drop** `p-tight` if the outer shell now supplies the inset). Prefer **one** padded container per region and plain inner rows unless the user asked to pad the label line separately.

**Block / section padding (grouped content)**
- **Single inset surface (default):** One padded wrapper per card/section region; inner headings, labels, and body text usually need **no** extra `p-*` unless the prompt calls out that line’s inset.
- When the user asks for padding around a **group** of elements (nav links, list section, card body), put **`p-{token}`** on **one** wrapper (`<div>`, `<nav>`, `<ul>`) that wraps the group, unless they only asked to pad one edge.
- For **uniform horizontal** or **vertical** padding on that wrapper, prefer **`px-{token}`** / **`py-{token}`** over mixing unrelated **`pt-*`** and **`pl-*`** unless the prompt targets a single edge only.
- **Token name `inline`:** **`pl-inline`** means padding-**left** using the spacing scale key `inline`. If they want the **`inline`** rhythm as padding **around** a region, use **`p-inline`**, **`px-inline`**, or **`py-inline`** as appropriate—not only `pl-inline` combined with arbitrary `pt-*`.

**Axis control (which sides to apply)**
Use this table **only when the user is explicitly setting padding or margin** on an element (or you are following their instruction to pad a named region). Do **not** use it as a reason to add `p-*` on unrelated elements.

When the user names a token AND specifies which sides, map the axis phrase to the exact Tailwind prefix. The same applies to margin (`m-` family) when they say "margin" instead of "padding".

- **all sides / all around / (no side named in that padding request)** → `p-{token}` (e.g. `p-tight`). This applies to **that** spacing request only — not to every wrapper in the fragment. Do **not** use `pt-{token}` + `pl-{token}` — that is NOT "all sides".
- **top only** → `pt-{token}` (e.g. `pt-tight`)
- **bottom only** → `pb-{token}` (e.g. `pb-tight`)
- **left only** → `pl-{token}` (e.g. `pl-tight`)
- **right only** → `pr-{token}` (e.g. `pr-tight`)
- **left and right / horizontal only / x-axis** → `px-{token}` (e.g. `px-tight`)
- **top and bottom / vertical only / y-axis** → `py-{token}` (e.g. `py-tight`)
- **remove padding on X side** → set `p{side}-0` on the target element; preserve all other padding classes on siblings and ancestors.

Apply this mapping to **the specific element or wrapper the user pointed to**, leave everything else unchanged.
"""
