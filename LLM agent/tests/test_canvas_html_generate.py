"""Tests for canvas_html_generate (no Vertex calls)."""

from __future__ import annotations

import unittest

from canvas_html_generate import (
    build_canvas_html_contents,
    normalize_model_html,
    parse_html_generate_response,
    strip_markdown_fences,
)
from canvas_plan import CanvasPlanPromptBody, CanvasReferenceBlock


class TestStripMarkdownFences(unittest.TestCase):
    def test_plain_html_unchanged(self) -> None:
        s = '<div class="p-4">Hi</div>'
        self.assertEqual(strip_markdown_fences(s), s)

    def test_fenced_html(self) -> None:
        raw = "```html\n<div>ok</div>\n```"
        self.assertEqual(strip_markdown_fences(raw), "<div>ok</div>")

    def test_fenced_with_preamble(self) -> None:
        raw = "Here:\n```html\n<section>x</section>\n```\ntrailing"
        self.assertEqual(strip_markdown_fences(raw), "<section>x</section>")


class TestNormalizeModelHtml(unittest.TestCase):
    def test_strips_script(self) -> None:
        raw = "<div>a</div><script>evil()</script><p>b</p>"
        out = normalize_model_html(raw, "t")
        self.assertNotIn("script", out.lower())
        self.assertIn("<div", out)

    def test_rejects_non_html(self) -> None:
        with self.assertRaises(ValueError):
            normalize_model_html("just text", "t")


class TestParseHtmlGenerateResponse(unittest.TestCase):
    def test_parse_ok(self) -> None:
        d = parse_html_generate_response("<article>ok</article>", "Build a card")
        self.assertEqual(d["html"], "<article>ok</article>")
        self.assertEqual(d["title"], "Build a card")


class TestBuildCanvasHtmlContentsReferences(unittest.TestCase):
    def test_includes_reference_block_before_latest_request(self) -> None:
        body = CanvasPlanPromptBody(
            prompt="Add a row below",
            canvas_references=[
                CanvasReferenceBlock(
                    node_id="abc-123",
                    kind="htmlSnippet",
                    context="<div>existing</div>",
                ),
            ],
        )
        text = build_canvas_html_contents(body)
        self.assertIn("Referenced canvas blocks", text)
        self.assertIn("node_id=abc-123", text)
        self.assertIn("<div>existing</div>", text)
        idx_ref = text.index("Referenced canvas blocks")
        idx_latest = text.index("Latest user request")
        self.assertLess(idx_ref, idx_latest)


if __name__ == "__main__":
    unittest.main()
