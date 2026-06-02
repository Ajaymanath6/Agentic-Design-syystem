"""Golden substrings for generative spacing intent prompts (no Vertex)."""

from __future__ import annotations

import unittest

from canvas_html_generate import CANVAS_HTML_CREATOR_SYSTEM
from canvas_html_spacing_pass import SPACING_FIX_SYSTEM
from generative_spacing_intent import GENERATIVE_SPACING_INTENT_SECTION
from layout_html_generate import LAYOUT_HTML_CREATOR_SYSTEM


class TestGenerativeSpacingIntent(unittest.TestCase):
    def test_shared_section_token_first(self) -> None:
        self.assertIn("No gratuitous spacing", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("Nested padding compounds", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("Token-first", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("Surgical edits", GENERATIVE_SPACING_INTENT_SECTION)

    def test_block_section_padding_subsection(self) -> None:
        self.assertIn("Block / section padding (grouped content)", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("Single inset surface (default)", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("pl-inline", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("p-inline", GENERATIVE_SPACING_INTENT_SECTION)

    def test_surgical_nested_padding_exception(self) -> None:
        self.assertIn("**Exception:**", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("nested padding", GENERATIVE_SPACING_INTENT_SECTION)

    def test_canvas_system_includes_intent(self) -> None:
        self.assertIn("Spacing intent (precise edits)", CANVAS_HTML_CREATOR_SYSTEM)

    def test_canvas_layout_single_inset_system_bullet(self) -> None:
        self.assertIn("**Single inset:**", CANVAS_HTML_CREATOR_SYSTEM)
        self.assertIn("**Single inset:**", LAYOUT_HTML_CREATOR_SYSTEM)
        self.assertIn("one** outer wrapper only", CANVAS_HTML_CREATOR_SYSTEM)

    def test_layout_system_includes_intent(self) -> None:
        self.assertIn("Spacing intent (precise edits)", LAYOUT_HTML_CREATOR_SYSTEM)

    def test_spacing_pass_single_axis(self) -> None:
        self.assertIn("Single-axis", SPACING_FIX_SYSTEM)
        self.assertIn("Minimal change", SPACING_FIX_SYSTEM)
        self.assertIn("Block / section padding", SPACING_FIX_SYSTEM)

    def test_axis_control_subsection_present(self) -> None:
        self.assertIn("Axis control (which sides to apply)", GENERATIVE_SPACING_INTENT_SECTION)

    def test_axis_control_all_sides(self) -> None:
        # Default / no axis = p-{token}, not pt- + pl- split
        self.assertIn("all sides", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("p-{token}", GENERATIVE_SPACING_INTENT_SECTION)

    def test_axis_control_horizontal_vertical(self) -> None:
        # Axis shortcuts
        self.assertIn("px-{token}", GENERATIVE_SPACING_INTENT_SECTION)
        self.assertIn("py-{token}", GENERATIVE_SPACING_INTENT_SECTION)

    def test_axis_control_single_edges(self) -> None:
        # All four individual edges represented
        for prefix in ("pt-{token}", "pb-{token}", "pl-{token}", "pr-{token}"):
            self.assertIn(prefix, GENERATIVE_SPACING_INTENT_SECTION)

    def test_axis_control_removal(self) -> None:
        self.assertIn("p{side}-0", GENERATIVE_SPACING_INTENT_SECTION)

    def test_spacing_pass_axis_resolution(self) -> None:
        self.assertIn("Axis resolution", SPACING_FIX_SYSTEM)

    def test_spacing_pass_no_gratuitous_injection(self) -> None:
        self.assertIn("No new gratuitous spacing", SPACING_FIX_SYSTEM)

    def test_spacing_pass_avoid_double_inset(self) -> None:
        self.assertIn("Avoid double inset", SPACING_FIX_SYSTEM)
        self.assertIn("single inset surface", SPACING_FIX_SYSTEM)
        self.assertIn("p-card-pad-*", SPACING_FIX_SYSTEM)


if __name__ == "__main__":
    unittest.main()
