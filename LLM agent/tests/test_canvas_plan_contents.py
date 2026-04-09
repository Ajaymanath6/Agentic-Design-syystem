"""Tests for `build_canvas_plan_contents` (no Vertex calls)."""

from __future__ import annotations

import unittest

from canvas_plan import (
    CanvasPlanChatMessage,
    CanvasPlanPromptBody,
    build_canvas_plan_contents,
    parse_and_validate_canvas_plan,
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

    def test_card_null_subtitle_coerced_to_empty_string(self) -> None:
        raw = (
            '{"version":1,"nodes":['
            '{"kind":"card","title":"KILA UI","subtitle":null,"body":"Nav below"},'
            '{"kind":"neutralButton","label":"OK"}'
            "]}"
        )
        plan = parse_and_validate_canvas_plan(raw)
        card = plan.nodes[0]
        self.assertEqual(card.kind, "card")
        self.assertEqual(card.subtitle, "")

    def test_version2_product_sidebar_parses(self) -> None:
        raw = (
            '{"version":2,"nodes":['
            '{"kind":"productSidebar","title":"Acme",'
            '"trailingIconKey":"chevronDown","searchPlaceholder":"Go",'
            '"neutralButtonLabel":"Add","sections":['
            '{"heading":"Main","items":[{"label":"Home","iconKey":"home"}]}'
            "]}]}"
        )
        plan = parse_and_validate_canvas_plan(raw)
        self.assertEqual(plan.version, 2)
        node = plan.nodes[0]
        self.assertEqual(node.kind, "productSidebar")
        self.assertEqual(node.title, "Acme")
        self.assertEqual(node.trailing_icon_key, "chevronDown")
        self.assertEqual(node.search_placeholder, "Go")
        self.assertEqual(node.neutral_button_label, "Add")
        self.assertEqual(node.sections[0].heading, "Main")
        self.assertEqual(node.sections[0].items[0].label, "Home")
        self.assertEqual(node.sections[0].items[0].icon_key, "home")


if __name__ == "__main__":
    unittest.main()
