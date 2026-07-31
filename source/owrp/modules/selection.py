"""Reusable slot selection without coupling game-specific rosters."""

from __future__ import annotations

import random
from typing import Any


def choose(
    catalog: list[dict[str, Any]],
    blocked: set[str],
    used: set[str],
    allow_duplicates: bool,
) -> dict[str, Any] | None:
    candidates = [
        entry for entry in catalog
        if entry["key"] not in blocked and (allow_duplicates or entry["key"] not in used)
    ]
    if not candidates and not allow_duplicates:
        candidates = [entry for entry in catalog if entry["key"] not in blocked]
    return dict(random.choice(candidates)) if candidates else None

