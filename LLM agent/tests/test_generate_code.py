"""Tests for VS Code extension bridge (generate_code) — no Vertex calls."""

from __future__ import annotations

import json
import os
import sys
import unittest
from unittest.mock import patch

# LLM agent root on path (same pattern as other tests)
_AGENT_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), ".."))
if _AGENT_ROOT not in sys.path:
    sys.path.insert(0, _AGENT_ROOT)

from generate_code import (  # noqa: E402
    GenerateCodeBody,
    catalog_lookup_ref,
    is_catalog_fast_path,
    norm_ref,
    resolve_catalog_by_display_name,
    resolve_catalog_prompt,
    resolve_catalog_ref,
    strip_component_suffix,
)
from theme_context.catalog_index import catalog_json_path, load_full_source_html  # noqa: E402

KNOWN_CARD_ID = "canvas-card-575a7048-23c2-4293-b4b7-03a8035cc8a5"
KNOWN_IMPORT_ID = "CanvasCard575a704823c24293B4b703a8035cc8a5Component"
KNOWN_BP_PATH = f"/blueprints/{KNOWN_CARD_ID}.json"
SECONDARY_BP_PATH = "/blueprints/canvas-html-a405bd99-38f2-4175-86f4-ec8ef05abd23.json"
CARD_BY_NAME_BP_PATH = "/blueprints/canvas-html-9ad54d89-bd94-4419-aa3e-7f5da4b8b1f2.json"


class TestNormRef(unittest.TestCase):
    def test_norm_ref_collapses_spaces_and_case(self) -> None:
        self.assertEqual(norm_ref("Canvas Card"), "canvascard")
        self.assertEqual(norm_ref("foo_bar"), "foo-bar")

    def test_strip_component_suffix(self) -> None:
        self.assertEqual(
            strip_component_suffix("CanvasCardComponent"),
            "CanvasCard",
        )


class TestResolveCatalogRef(unittest.TestCase):
    def test_resolve_by_catalog_id(self) -> None:
        html = resolve_catalog_ref(KNOWN_CARD_ID)
        self.assertIsNotNone(html)
        assert html is not None
        self.assertIn("brandcolor-", html)
        disk = load_full_source_html(KNOWN_BP_PATH)
        self.assertEqual(html, disk)

    def test_resolve_by_import_id(self) -> None:
        by_id = resolve_catalog_ref(KNOWN_CARD_ID)
        by_import = resolve_catalog_ref(KNOWN_IMPORT_ID)
        self.assertEqual(by_id, by_import)

    def test_unknown_ref_returns_none(self) -> None:
        self.assertIsNone(resolve_catalog_ref("fake-id-xyz-not-in-catalog"))


class TestResolveCatalogByDisplayName(unittest.TestCase):
    def test_resolve_secondry(self) -> None:
        html = resolve_catalog_by_display_name("secondry")
        self.assertIsNotNone(html)
        assert html is not None
        self.assertIn("bg-brandcolor-secondary", html)
        self.assertEqual(html, load_full_source_html(SECONDARY_BP_PATH))

    def test_secondary_typo_does_not_match_secondry(self) -> None:
        self.assertIsNone(resolve_catalog_by_display_name("secondary"))

    def test_resolve_card(self) -> None:
        html = resolve_catalog_by_display_name("card")
        self.assertIsNotNone(html)
        assert html is not None
        self.assertEqual(html, load_full_source_html(CARD_BY_NAME_BP_PATH))

    def test_resolve_canvas_card_with_spaces(self) -> None:
        html = resolve_catalog_by_display_name("Canvas card")
        self.assertIsNotNone(html)
        assert html is not None
        self.assertEqual(html, load_full_source_html(KNOWN_BP_PATH))

    def test_resolve_catalog_prompt_uses_name_after_id_miss(self) -> None:
        html = resolve_catalog_prompt("secondry")
        self.assertIsNotNone(html)
        assert html is not None
        self.assertIn("bg-brandcolor-secondary", html)


class TestFastPathHelpers(unittest.TestCase):
    def test_is_catalog_fast_path_no_spaces(self) -> None:
        body = GenerateCodeBody(
            prompt=KNOWN_CARD_ID,
            blueprintId=KNOWN_CARD_ID,
        )
        self.assertTrue(is_catalog_fast_path(body, KNOWN_CARD_ID))

    def test_is_catalog_fast_path_with_spaces(self) -> None:
        body = GenerateCodeBody(prompt="a primary button")
        self.assertFalse(is_catalog_fast_path(body, "a primary button"))

    def test_catalog_lookup_ref_prefers_blueprint_id(self) -> None:
        body = GenerateCodeBody(prompt="ignored", blueprintId=KNOWN_CARD_ID)
        self.assertEqual(catalog_lookup_ref(body, "ignored"), KNOWN_CARD_ID)


class TestGenerateCodeEndpoint(unittest.TestCase):
    def test_empty_prompt_returns_422(self) -> None:
        from fastapi import HTTPException
        from main import generate_code

        body = GenerateCodeBody(prompt="   ")
        with self.assertRaises(HTTPException) as ctx:
            generate_code(body)
        self.assertEqual(ctx.exception.status_code, 422)

    def test_unknown_id_returns_404(self) -> None:
        from fastapi import HTTPException
        from main import generate_code

        body = GenerateCodeBody(
            prompt="fake-id-xyz",
            blueprintId="fake-id-xyz",
        )
        with self.assertRaises(HTTPException) as ctx:
            generate_code(body)
        self.assertEqual(ctx.exception.status_code, 404)
        self.assertIn("Published names", str(ctx.exception.detail))

    def test_secondry_name_returns_code(self) -> None:
        from main import generate_code

        body = GenerateCodeBody(prompt="secondry", blueprintId="secondry")
        out = generate_code(body)
        self.assertIn("bg-brandcolor-secondary", out["code"])

    def test_secondary_typo_returns_404_with_hints(self) -> None:
        from fastapi import HTTPException
        from main import generate_code

        body = GenerateCodeBody(prompt="secondary", blueprintId="secondary")
        with self.assertRaises(HTTPException) as ctx:
            generate_code(body)
        self.assertEqual(ctx.exception.status_code, 404)
        self.assertIn("Published names", str(ctx.exception.detail))

    @patch("main._canvas_generate_html_impl")
    def test_spaced_display_name_skips_nl(self, mock_impl: unittest.mock.MagicMock) -> None:
        from main import generate_code

        body = GenerateCodeBody(prompt="Canvas card")
        out = generate_code(body)
        self.assertEqual(out["code"], load_full_source_html(KNOWN_BP_PATH))
        mock_impl.assert_not_called()

    def test_known_id_returns_code(self) -> None:
        from main import generate_code

        body = GenerateCodeBody(
            prompt=KNOWN_CARD_ID,
            blueprintId=KNOWN_CARD_ID,
        )
        out = generate_code(body)
        self.assertIn("code", out)
        self.assertIn("brandcolor-", out["code"])
        self.assertEqual(out["code"], load_full_source_html(KNOWN_BP_PATH))

    @patch("main._canvas_generate_html_impl")
    def test_nl_path_maps_html_to_code(self, mock_impl: unittest.mock.MagicMock) -> None:
        from main import generate_code

        mock_impl.return_value = {"html": "<div>ok</div>", "title": "t"}
        body = GenerateCodeBody(prompt="a primary button labeled Submit")
        out = generate_code(body)
        self.assertEqual(out, {"code": "<div>ok</div>"})
        mock_impl.assert_called_once()
        call_body = mock_impl.call_args[0][0]
        self.assertEqual(call_body.prompt, "a primary button labeled Submit")


class TestCatalogIndexOnDisk(unittest.TestCase):
    def test_catalog_json_exists(self) -> None:
        path = catalog_json_path()
        self.assertTrue(os.path.isfile(path), msg=f"missing {path}")

    def test_catalog_lists_known_card(self) -> None:
        with open(catalog_json_path(), encoding="utf-8") as f:
            data = json.load(f)
        ids = [c.get("id") for c in data.get("components", [])]
        self.assertIn(KNOWN_CARD_ID, ids)


if __name__ == "__main__":
    unittest.main()
