"""Unit tests for layout HTML prompt assembly (no Vertex calls)."""

from __future__ import annotations

import unittest

from layout_html_generate import build_layout_html_contents
from layout_plan import LayoutCatalogReferenceBlock, LayoutHtmlRequestBody


class TestBuildLayoutHtmlContents(unittest.TestCase):
    def test_includes_allowlist_and_prompt(self) -> None:
        body = LayoutHtmlRequestBody(
            prompt="Hero with CTA",
            catalogAllowlist=["case-card", "CaseCardComponent"],
        )
        s = build_layout_html_contents(body)
        self.assertIn("case-card", s)
        self.assertIn("Hero with CTA", s)
        self.assertIn("Allowed catalog refs", s)

    def test_extended_design_context_adds_tailwind_blurb(self) -> None:
        body = LayoutHtmlRequestBody(
            prompt="x",
            catalogAllowlist=[],
            extended_design_context=True,
        )
        s = build_layout_html_contents(body)
        self.assertIn("Tailwind config", s)

    def test_reference_blocks_included(self) -> None:
        body = LayoutHtmlRequestBody(
            prompt="Compose a row",
            catalogAllowlist=["a"],
            catalogReferenceBlocks=[
                LayoutCatalogReferenceBlock(
                    id="id-1",
                    label="Demo",
                    htmlSnippet="<div class='p-2'>hi</div>",
                )
            ],
        )
        s = build_layout_html_contents(body)
        self.assertIn("Published catalog HTML", s)
        self.assertIn("id-1", s)
        self.assertIn("p-2", s)


if __name__ == "__main__":
    unittest.main()
