"""Shared Pydantic models for optional theme context on API bodies."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class ThemeSnapshotModel(BaseModel):
    """Client overrides (e.g. Theme editor local hex) merged into palette block only."""

    model_config = ConfigDict(extra="forbid")

    colors: dict[str, str] | None = Field(default=None, max_length=64)


def snapshot_colors(snapshot: ThemeSnapshotModel | None) -> dict[str, str] | None:
    if snapshot is None or snapshot.colors is None:
        return None
    return snapshot.colors
