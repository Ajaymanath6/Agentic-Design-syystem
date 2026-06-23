"""Assemble theme + catalog context for Vertex prompts."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Mapping

from theme_context.file_loaders import load_theme_guide_snippet

from theme_context.catalog_index import (
    format_catalog_excerpts_block,
    retrieve_catalog_by_keywords,
    wants_similarity_search,
)
from theme_context.config import (
    theme_context_max_chars,
    theme_context_mode,
    theme_context_palette_max_chars,
)
from theme_context.palette import format_palette_block, merge_palette, parse_brand_colors_from_ts
from theme_context.rule_retriever import retrieve_rule_chunks
from theme_context.tailwind_filter import filter_tailwind_config_snippet
from theme_context.token_help import retrieve_token_help
from theme_context.vector_retriever import (
    retrieve_vector_chunks,
    vector_hits_to_catalog_excerpts,
    vector_hits_to_theme_chunks,
)

logger = logging.getLogger(__name__)


@dataclass
class ThemeContextBundle:
    theme_guide_section: str
    palette_section: str
    catalog_section: str
    used_legacy_fallback: bool
    mode: str


def assemble_theme_context(
    prompt: str,
    *,
    extended: bool = False,
    mode: str | None = None,
    theme_snapshot: Mapping[str, str] | None = None,
    include_catalog_search: bool = True,
) -> ThemeContextBundle:
    resolved_mode = (mode or theme_context_mode()).strip().lower()
    max_chars = theme_context_max_chars(extended)
    palette_max = theme_context_palette_max_chars()

    file_colors = parse_brand_colors_from_ts()
    colors = merge_palette(file_colors, theme_snapshot)
    palette_section = format_palette_block(colors, max_chars=palette_max)

    if resolved_mode == "legacy":
        legacy = load_theme_guide_snippet(max_chars)
        return ThemeContextBundle(
            theme_guide_section=legacy,
            palette_section=palette_section,
            catalog_section="",
            used_legacy_fallback=True,
            mode="legacy",
        )

    try:
        parts: list[str] = []
        seen_ids: set[str] = set()

        def add_part(text: str, chunk_id: str) -> None:
            if not text.strip() or chunk_id in seen_ids:
                return
            seen_ids.add(chunk_id)
            parts.append(text.strip())

        for chunk in retrieve_rule_chunks(prompt, top_k=3):
            add_part(chunk.text, chunk.chunk_id)

        for entry in retrieve_token_help(prompt, top_k=2):
            help_text = f"Token help ({entry.title}):\n{entry.text}"
            add_part(help_text, f"help:{entry.entry_id}")

        if resolved_mode == "rag":
            vector_hits = retrieve_vector_chunks(prompt, top_k=5)
            if vector_hits:
                for chunk in vector_hits_to_theme_chunks(vector_hits):
                    add_part(chunk.text, chunk.chunk_id)
            else:
                logger.warning("RAG mode: vector retrieval empty — continuing with rule chunks")

        catalog_section = ""
        if include_catalog_search and (
            wants_similarity_search(prompt) or "catalog" in prompt.lower()
        ):
            recs = retrieve_catalog_by_keywords(prompt, top_k=2)
            catalog_section = format_catalog_excerpts_block(recs)

        if resolved_mode == "rag" and not catalog_section:
            vec_cat = vector_hits_to_catalog_excerpts(
                retrieve_vector_chunks(prompt, top_k=3),
            )
            if vec_cat:
                catalog_section = vec_cat

        if not parts:
            logger.warning(
                "Theme context: no chunks retrieved (mode=%s) — legacy fallback",
                resolved_mode,
            )
            legacy = load_theme_guide_snippet(max_chars)
            return ThemeContextBundle(
                theme_guide_section=legacy,
                palette_section=palette_section,
                catalog_section=catalog_section,
                used_legacy_fallback=True,
                mode=resolved_mode,
            )

        merged = "\n\n---\n\n".join(parts)
        if len(merged) > max_chars:
            merged = merged[: max_chars - 40].rstrip() + "\n... (theme context truncated)"

        return ThemeContextBundle(
            theme_guide_section=merged,
            palette_section=palette_section,
            catalog_section=catalog_section,
            used_legacy_fallback=False,
            mode=resolved_mode,
        )
    except Exception as e:
        logger.warning("Theme context assembly failed: %s — legacy fallback", e)
        legacy = load_theme_guide_snippet(max_chars)
        return ThemeContextBundle(
            theme_guide_section=legacy,
            palette_section=palette_section,
            catalog_section="",
            used_legacy_fallback=True,
            mode=resolved_mode,
        )


def format_theme_context_for_prompt(
    bundle: ThemeContextBundle,
    *,
    theme_heading: str = "Theme guide JSON (token reference):",
) -> list[str]:
    out: list[str] = [bundle.palette_section, f"{theme_heading}", bundle.theme_guide_section]
    if bundle.catalog_section.strip():
        out.append(bundle.catalog_section)
    return out


def load_tailwind_context_snippet(*, extended: bool, mode: str | None = None) -> str:
    resolved = (mode or theme_context_mode()).strip().lower()
    max_chars = 10000 if extended else 0
    if not extended:
        return ""
    if resolved in ("smart", "rag"):
        return filter_tailwind_config_snippet(max_chars)
    from theme_context.file_loaders import load_tailwind_config_snippet

    return load_tailwind_config_snippet(max_chars)
