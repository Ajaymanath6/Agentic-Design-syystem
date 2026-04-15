"""Tests for optional spacing fix JSON pass (no Vertex calls)."""

from __future__ import annotations

import unittest

from canvas_html_spacing_pass import parse_spacing_fix_json


class TestParseSpacingFixJson(unittest.TestCase):
    def test_valid(self) -> None:
        raw = '{"html":"<div class=\\"flex gap-micro\\"><span>a</span></div>"}'
        out = parse_spacing_fix_json(raw)
        self.assertIsNotNone(out)
        assert out is not None
        self.assertIn("gap-micro", out)
        self.assertIn("<div", out)

    def test_fenced(self) -> None:
        raw = """```json
{"html":"<p class=\\"p-cozy\\">x</p>"}
```"""
        out = parse_spacing_fix_json(raw)
        self.assertIsNotNone(out)
        assert out is not None
        self.assertIn("p-cozy", out)

    def test_rejects_unclosed_script(self) -> None:
        raw = r'{"html":"<div>ok</div><script>evil()"}'
        self.assertIsNone(parse_spacing_fix_json(raw))

    def test_invalid(self) -> None:
        self.assertIsNone(parse_spacing_fix_json("not json"))
        self.assertIsNone(parse_spacing_fix_json('{"foo":1}'))
        self.assertIsNone(parse_spacing_fix_json('{"html":""}'))

    def test_max_len(self) -> None:
        long_inner = "x" * 20_000
        raw = '{"html":"<div>' + long_inner + '</div>"}'
        self.assertIsNone(parse_spacing_fix_json(raw, max_len=100))


if __name__ == "__main__":
    unittest.main()
