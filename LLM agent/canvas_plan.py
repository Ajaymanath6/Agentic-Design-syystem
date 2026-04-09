"""Structured components-canvas plan (v1): JSON for admin canvas world nodes."""

from __future__ import annotations

import logging
from typing import Annotated, Literal, Union

from pydantic import BaseModel, ConfigDict, Field

from layout_plan import (
    extract_json_object,
    load_tailwind_config_snippet,
    load_theme_guide_snippet,
)

logger = logging.getLogger(__name__)

TAILWIND_BRAND_CONTRACT = """
Tailwind theme (use these token names in reasoning; output JSON only, no class strings in output):
- Colors: brandcolor-primary #F84416, brandcolor-textstrong #1A1A1A, brandcolor-textweak #575757,
  brandcolor-strokeweak #E5E5E5, brandcolor-strokestrong #575757, brandcolor-fill #F5F5F5,
  brandcolor-white #FFFFFF, brandcolor-secondary #0A0A0A, etc. (see tailwind.config.js theme.extend.colors).
- Canvas published blocks use theme-guide card/button strings and .confirm-password-canvas-input / .text-field-canvas-input in index.css.
- Spacing: Tailwind scale; card uses rounded-lg border border-brandcolor-strokeweak patterns from theme-guide.componentGuidelines.card.
"""

CANVAS_PLAN_SYSTEM = """You are a planner for the **components canvas** in an internal design-system admin app.

Output ONLY a single JSON object. No markdown fences, no backticks, no HTML, no commentary.

Required shape:
{
  "version": 1,
  "nodes": [ ... ]
}

Each element of "nodes" MUST include "kind" as one of:
- "card" — { "kind": "card", "title": "...", "subtitle": "...", "body": "..." }
  Optional: "x", "y" (numbers, pixel positions on a 3200×2400 world; omit to let the client stack below existing blocks).
- "primaryButton" | "secondaryButton" | "neutralButton" — { "kind": "primaryButton", "label": "..." }
  Optional: "x", "y"
- "confirmPasswordInput" | "textInputField" — { "kind": "confirmPasswordInput", "label": "..." }
  Optional: "x", "y"

Rules:
- Use theme-guide semantics for copy (text-strong / text-weak tone). Keep strings concise.
- Prefer 1–6 nodes per response unless the user asks for more (max 12).
- Do not output "id" fields; the client assigns UUIDs.
- If the user asks for a form row, emit separate nodes (e.g. textInputField + primaryButton) with distinct labels.
- If a conversation history is included, use it for context; still output only one JSON plan for the **latest** user request below.
"""

MAX_CANVAS_CHAT_MESSAGES = 20
MAX_CANVAS_CHAT_MESSAGE_CHARS = 4000
MAX_CANVAS_HISTORY_TOTAL_CHARS = 24000


class CanvasPlanChatMessage(BaseModel):
    model_config = ConfigDict(extra="forbid")

    role: Literal["user", "assistant"] = Field(...)
    content: str = Field(..., min_length=1, max_length=MAX_CANVAS_CHAT_MESSAGE_CHARS)


class CanvasPlanPromptBody(BaseModel):
    model_config = ConfigDict(extra="forbid")

    prompt: str = Field(..., min_length=1, max_length=32000)
    messages: list[CanvasPlanChatMessage] | None = Field(
        default=None,
        max_length=MAX_CANVAS_CHAT_MESSAGES,
    )
    extended_design_context: bool = Field(default=False)


class CardNodeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["card"] = "card"
    title: str = Field(default="", max_length=500)
    subtitle: str = Field(default="", max_length=500)
    body: str = Field(default="", max_length=4000)
    x: float | None = None
    y: float | None = None


class PrimaryButtonNodeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["primaryButton"] = "primaryButton"
    label: str = Field(..., min_length=1, max_length=200)
    x: float | None = None
    y: float | None = None


class SecondaryButtonNodeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["secondaryButton"] = "secondaryButton"
    label: str = Field(..., min_length=1, max_length=200)
    x: float | None = None
    y: float | None = None


class NeutralButtonNodeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["neutralButton"] = "neutralButton"
    label: str = Field(..., min_length=1, max_length=200)
    x: float | None = None
    y: float | None = None


class ConfirmPasswordNodeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["confirmPasswordInput"] = "confirmPasswordInput"
    label: str = Field(..., min_length=1, max_length=200)
    x: float | None = None
    y: float | None = None


class TextInputFieldNodeModel(BaseModel):
    model_config = ConfigDict(extra="forbid")

    kind: Literal["textInputField"] = "textInputField"
    label: str = Field(..., min_length=1, max_length=200)
    x: float | None = None
    y: float | None = None


CanvasNodeSpec = Annotated[
    Union[
        CardNodeModel,
        PrimaryButtonNodeModel,
        SecondaryButtonNodeModel,
        NeutralButtonNodeModel,
        ConfirmPasswordNodeModel,
        TextInputFieldNodeModel,
    ],
    Field(discriminator="kind"),
]


class CanvasPlanV1Model(BaseModel):
    model_config = ConfigDict(extra="forbid")

    version: Literal[1] = 1
    nodes: list[CanvasNodeSpec] = Field(min_length=1, max_length=24)


def parse_and_validate_canvas_plan(raw_text: str) -> CanvasPlanV1Model:
    obj = extract_json_object(raw_text)
    plan = CanvasPlanV1Model.model_validate(obj)
    return plan


def _normalize_chat_messages(
    messages: list[CanvasPlanChatMessage] | None,
) -> list[CanvasPlanChatMessage]:
    if not messages:
        return []
    trimmed = messages[-MAX_CANVAS_CHAT_MESSAGES:]
    normalized: list[CanvasPlanChatMessage] = []
    for m in trimmed:
        c = m.content
        if len(c) > MAX_CANVAS_CHAT_MESSAGE_CHARS:
            c = c[:MAX_CANVAS_CHAT_MESSAGE_CHARS] + "\n... (truncated)"
            logger.warning(
                "canvas_plan chat message truncated to %s chars",
                MAX_CANVAS_CHAT_MESSAGE_CHARS,
            )
        normalized.append(CanvasPlanChatMessage(role=m.role, content=c))
    # Prefer recent turns: walk from newest backward until history budget is full.
    selected: list[CanvasPlanChatMessage] = []
    total = 0
    for m in reversed(normalized):
        line_len = len(m.content) + 24
        if total + line_len > MAX_CANVAS_HISTORY_TOTAL_CHARS:
            logger.warning(
                "canvas_plan dropped oldest conversation turns (history cap %s chars)",
                MAX_CANVAS_HISTORY_TOTAL_CHARS,
            )
            break
        selected.append(m)
        total += line_len
    selected.reverse()
    return selected


def _format_conversation_block(history: list[CanvasPlanChatMessage]) -> str:
    lines = ["Conversation (oldest first):"]
    for m in history:
        label = "User" if m.role == "user" else "Assistant"
        lines.append(f"{label}: {m.content}")
    return "\n".join(lines)


def build_canvas_plan_contents(body: CanvasPlanPromptBody) -> str:
    theme_max = 12000 if body.extended_design_context else 6000
    theme_snippet = load_theme_guide_snippet(theme_max)

    parts: list[str] = [
        CANVAS_PLAN_SYSTEM,
        TAILWIND_BRAND_CONTRACT.strip(),
        "Theme guide JSON (token reference; follow componentGuidelines for cards/buttons):",
        theme_snippet,
    ]

    if body.extended_design_context:
        tw = load_tailwind_config_snippet(10000)
        parts.extend(
            [
                "Tailwind config (reference; file may be truncated):",
                tw,
            ]
        )

    history = _normalize_chat_messages(body.messages)
    if history:
        parts.append(_format_conversation_block(history))

    parts.extend(
        [
            "Latest user request:",
            body.prompt.strip(),
        ]
    )

    return "\n\n".join(parts)
