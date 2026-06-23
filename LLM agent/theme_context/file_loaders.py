"""Read theme-guide and tailwind config from disk (no layout_plan import)."""

from __future__ import annotations

import logging
import os

logger = logging.getLogger(__name__)


def theme_guide_path_default() -> str:
    override = os.environ.get("THEME_GUIDE_PATH", "").strip()
    if override:
        return os.path.abspath(os.path.expanduser(override))
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, "..", "..", "src", "config", "theme-guide.json"))


def load_theme_guide_snippet(max_chars: int = 6000) -> str:
    path = theme_guide_path_default()
    try:
        with open(path, encoding="utf-8") as f:
            raw = f.read()
    except OSError as e:
        logger.warning("Could not read theme guide at %s: %s", path, e)
        return "(theme guide not available on server)"
    if len(raw) <= max_chars:
        return raw
    return raw[:max_chars] + "\n... (truncated)"


def tailwind_config_path_default() -> str:
    override = os.environ.get("TAILWIND_CONFIG_PATH", "").strip()
    if override:
        return os.path.abspath(os.path.expanduser(override))
    here = os.path.dirname(os.path.abspath(__file__))
    return os.path.normpath(os.path.join(here, "..", "..", "tailwind.config.js"))


def load_tailwind_config_snippet(max_chars: int = 10000) -> str:
    path = tailwind_config_path_default()
    try:
        with open(path, encoding="utf-8") as f:
            raw = f.read()
    except OSError as e:
        logger.warning("Could not read tailwind config at %s: %s", path, e)
        return "(tailwind.config.js not available on server)"
    if len(raw) <= max_chars:
        return raw
    return raw[:max_chars] + "\n... (truncated)"
