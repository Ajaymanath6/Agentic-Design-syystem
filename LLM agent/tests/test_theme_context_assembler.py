"""Tests for theme context assembly (no Vertex)."""

from __future__ import annotations

import os
import unittest

from theme_context.assembler import assemble_theme_context  # noqa: E402
from theme_context.config import theme_context_mode
from theme_context.palette import parse_brand_colors_from_ts
from theme_context.rule_retriever import retrieve_rule_chunks
from theme_context.session_memory import compress_chat_messages_for_prompt


class TestThemeContextAssembler(unittest.TestCase):
    def setUp(self) -> None:
        self._prev_mode = os.environ.get("THEME_CONTEXT_MODE")

    def tearDown(self) -> None:
        if self._prev_mode is None:
            os.environ.pop("THEME_CONTEXT_MODE", None)
        else:
            os.environ["THEME_CONTEXT_MODE"] = self._prev_mode

    def test_legacy_mode_includes_full_guide_marker(self) -> None:
        os.environ["THEME_CONTEXT_MODE"] = "legacy"
        bundle = assemble_theme_context("add a primary button", extended=False, mode="legacy")
        self.assertTrue(bundle.used_legacy_fallback)
        self.assertIn("brandcolor-primary", bundle.palette_section)

    def test_smart_mode_palette_always_present(self) -> None:
        os.environ["THEME_CONTEXT_MODE"] = "smart"
        bundle = assemble_theme_context(
            "create a card with primary button",
            extended=False,
            mode="smart",
        )
        self.assertIn("Current brand palette", bundle.palette_section)
        self.assertIn("brandcolor-", bundle.palette_section)

    def test_smart_mode_button_prompt_retrieves_chunks(self) -> None:
        os.environ["THEME_CONTEXT_MODE"] = "smart"
        chunks = retrieve_rule_chunks("primary button and card", top_k=3)
        ids = {c.chunk_id for c in chunks}
        self.assertTrue(
            any("button" in i or "card" in i for i in ids)
            or "aiInstructions.criticalRules" in ids,
        )

    def test_parse_brand_colors_from_ts(self) -> None:
        colors = parse_brand_colors_from_ts()
        self.assertIn("brandcolor-primary", colors)
        self.assertTrue(colors["brandcolor-primary"].startswith("#"))

    def test_session_memory_compresses_long_history(self) -> None:
        class Msg:
            def __init__(self, role: str, content: str) -> None:
                self.role = role
                self.content = content

        messages = [
            Msg("user" if i % 2 == 0 else "assistant", f"turn {i}")
            for i in range(15)
        ]
        recent, summary = compress_chat_messages_for_prompt(messages)
        self.assertLessEqual(len(recent), 4)
        self.assertIsNotNone(summary)
        self.assertIn("Session memory", summary or "")

    def test_default_mode_is_smart(self) -> None:
        os.environ.pop("THEME_CONTEXT_MODE", None)
        self.assertEqual(theme_context_mode(), "smart")


if __name__ == "__main__":
    unittest.main()
