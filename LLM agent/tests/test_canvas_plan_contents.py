"""Tests for `build_canvas_plan_contents` (no Vertex calls)."""

from __future__ import annotations

import unittest

from canvas_plan import (
    CanvasPlanChatMessage,
    CanvasPlanPromptBody,
    build_canvas_plan_contents,
)


class TestBuildCanvasPlanContents(unittest.TestCase):
    def test_prompt_only_has_latest_user_request(self) -> None:
        body = CanvasPlanPromptBody(prompt="add a card")
        text = build_canvas_plan_contents(body)
        self.assertIn("Latest user request:", text)
        self.assertIn("add a card", text)
        self.assertNotIn("Conversation (oldest first):", text)

    def test_multi_turn_includes_conversation_block(self) -> None:
        body = CanvasPlanPromptBody(
            prompt="and a neutral button",
            messages=[
                CanvasPlanChatMessage(role="user", content="add card"),
                CanvasPlanChatMessage(role="assistant", content="Added card."),
            ],
        )
        text = build_canvas_plan_contents(body)
        self.assertIn("Conversation (oldest first):", text)
        self.assertIn("User: add card", text)
        self.assertIn("Assistant: Added card.", text)
        self.assertIn("Latest user request:", text)
        self.assertIn("and a neutral button", text)

    def test_extended_design_context_includes_tailwind_section(self) -> None:
        body = CanvasPlanPromptBody(prompt="go", extended_design_context=True)
        text = build_canvas_plan_contents(body)
        self.assertIn("Tailwind config (reference", text)
        self.assertIn("tailwind.config", text.lower())


if __name__ == "__main__":
    unittest.main()
