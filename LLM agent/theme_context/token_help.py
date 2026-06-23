"""Load token-help.json and retrieve by prompt keywords."""

from __future__ import annotations

import json
import logging
import os
import re
from dataclasses import dataclass

logger = logging.getLogger(__name__)

_HELP_CACHE: list["TokenHelpEntry"] | None = None


@dataclass(frozen=True)
class TokenHelpEntry:
    entry_id: str
    triggers: frozenset[str]
    title: str
    text: str


def token_help_path_default() -> str:
    override = os.environ.get("TOKEN_HELP_PATH", "").strip()
    if override:
        return os.path.abspath(os.path.expanduser(override))
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.join(here, "..", "knowledge", "token-help.json")


def load_token_help_entries(force_reload: bool = False) -> list[TokenHelpEntry]:
    global _HELP_CACHE
    if _HELP_CACHE is not None and not force_reload:
        return _HELP_CACHE

    path = token_help_path_default()
    try:
        with open(path, encoding="utf-8") as f:
            raw = json.load(f)
    except OSError as e:
        logger.warning("Could not read token help at %s: %s", path, e)
        _HELP_CACHE = []
        return _HELP_CACHE

    entries: list[TokenHelpEntry] = []
    if not isinstance(raw, list):
        _HELP_CACHE = []
        return _HELP_CACHE

    for item in raw:
        if not isinstance(item, dict):
            continue
        entry_id = str(item.get("id", "")).strip()
        title = str(item.get("title", entry_id)).strip()
        text = str(item.get("text", "")).strip()
        triggers_raw = item.get("triggers", [])
        if not entry_id or not text:
            continue
        triggers: set[str] = set()
        if isinstance(triggers_raw, list):
            for t in triggers_raw:
                if isinstance(t, str) and t.strip():
                    triggers.add(t.strip().lower())
        triggers.add(entry_id.lower())
        entries.append(
            TokenHelpEntry(
                entry_id=entry_id,
                triggers=frozenset(triggers),
                title=title,
                text=text,
            ),
        )

    _HELP_CACHE = entries
    return entries


def retrieve_token_help(prompt: str, *, top_k: int = 2) -> list[TokenHelpEntry]:
    prompt_l = prompt.lower()
    scored: list[tuple[int, TokenHelpEntry]] = []
    for entry in load_token_help_entries():
        score = 0
        for trig in entry.triggers:
            if trig in prompt_l or trig.replace("-", "") in prompt_l.replace("-", ""):
                score += 2 if " " not in trig else 1
        if score > 0:
            scored.append((score, entry))
    scored.sort(key=lambda x: (-x[0], x[1].entry_id))
    return [e for _, e in scored[:top_k]]
