"""Environment-driven theme context settings."""

from __future__ import annotations

import os

VALID_MODES = frozenset({"legacy", "smart", "rag"})


def theme_context_mode() -> str:
    raw = os.environ.get("THEME_CONTEXT_MODE", "smart").strip().lower()
    return raw if raw in VALID_MODES else "smart"


def theme_context_max_chars(extended: bool = False) -> int:
    if extended:
        override = os.environ.get("THEME_CONTEXT_MAX_CHARS_EXTENDED", "").strip()
        if override.isdigit():
            return int(override)
        return 12000
    override = os.environ.get("THEME_CONTEXT_MAX_CHARS", "").strip()
    if override.isdigit():
        return int(override)
    return 6000


def theme_context_palette_max_chars() -> int:
    override = os.environ.get("THEME_CONTEXT_PALETTE_MAX_CHARS", "").strip()
    if override.isdigit():
        return int(override)
    return 1200


def rag_index_dir() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    override = os.environ.get("RAG_INDEX_DIR", "").strip()
    if override:
        return os.path.abspath(os.path.expanduser(override))
    return os.path.join(here, "..", ".rag-index")


def layout_allowlist_prompt_max() -> int:
    override = os.environ.get("LAYOUT_ALLOWLIST_PROMPT_MAX", "").strip()
    if override.isdigit():
        return int(override)
    return 15


def session_memory_threshold() -> int:
    override = os.environ.get("SESSION_MEMORY_MESSAGE_THRESHOLD", "").strip()
    if override.isdigit():
        return int(override)
    return 12


def session_memory_keep_recent() -> int:
    override = os.environ.get("SESSION_MEMORY_KEEP_RECENT", "").strip()
    if override.isdigit():
        return int(override)
    return 4
