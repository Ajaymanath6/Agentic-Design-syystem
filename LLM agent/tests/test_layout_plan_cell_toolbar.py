"""Catalog block cellToolbar (addRemove) schema and sanitize."""

from __future__ import annotations

import unittest

from layout_plan import CatalogBlockModel, LayoutPlanV1Model, sanitize_plan


class TestLayoutPlanCellToolbar(unittest.TestCase):
    def test_catalog_block_accepts_cell_toolbar_add_remove(self) -> None:
        b = CatalogBlockModel(
            type="catalog",
            ref="demo-x",
            repeat=1,
            layout="flow",
            cellToolbar="addRemove",
        )
        self.assertEqual(b.cellToolbar, "addRemove")

    def test_sanitize_preserves_add_remove(self) -> None:
        plan = LayoutPlanV1Model(
            version=1,
            blocks=[
                CatalogBlockModel(
                    type="catalog",
                    ref="demo-x",
                    repeat=1,
                    layout="flow",
                    cellToolbar="addRemove",
                ),
            ],
        )
        cleaned = sanitize_plan(plan, ["demo-x"])
        self.assertEqual(len(cleaned.blocks), 1)
        b = cleaned.blocks[0]
        self.assertIsInstance(b, CatalogBlockModel)
        self.assertEqual(b.cellToolbar, "addRemove")


if __name__ == "__main__":
    unittest.main()
