"""Compress long chat histories for LLM prompts (stateless)."""

from __future__ import annotations

import logging
from typing import Any, Protocol, Sequence

from theme_context.config import session_memory_keep_recent, session_memory_threshold

logger = logging.getLogger(__name__)

MAX_SUMMARY_CHARS = 1500


class ChatMessageLike(Protocol):
    role: str
    content: str


def compress_chat_messages_for_prompt(
    messages: Sequence[Any] | None,
    *,
    session_summary: str | None = None,
) -> tuple[list[Any], str | None]:
    """
    Returns (messages_for_prompt, optional_summary_block_text).
    When over threshold, older turns collapse into a summary block string.
    """
    if not messages:
        return [], None

    threshold = session_memory_threshold()
    keep_recent = session_memory_keep_recent()
    if len(messages) <= threshold:
        return list(messages), None

    recent = list(messages[-keep_recent:])
    older = list(messages[:-keep_recent])

    summary_parts: list[str] = []
    if session_summary and session_summary.strip():
        summary_parts.append(session_summary.strip())
    else:
        lines = ["Session memory (compressed older turns):"]
        for m in older[-8:]:
            role = getattr(m, "role", "user")
            content = getattr(m, "content", "")
            if not isinstance(content, str):
                continue
            snippet = content.strip()
            if len(snippet) > 400:
                snippet = snippet[:380] + "…"
            label = "User" if role == "user" else "Assistant"
            lines.append(f"{label}: {snippet}")
        summary_parts.append("\n".join(lines))

    block = summary_parts[0] if len(summary_parts) == 1 else "\n".join(summary_parts)
    if len(block) > MAX_SUMMARY_CHARS:
        block = block[: MAX_SUMMARY_CHARS - 20] + "… (truncated)"

    logger.info(
        "Session memory: compressed %s messages to summary + %s recent",
        len(older),
        len(recent),
    )
    return recent, block
