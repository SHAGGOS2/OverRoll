"""Stable contract shared by every supported game."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class ModuleMetadata:
    game_id: str
    name: str
    short_name: str
    accent: str
    status: str
    description: str
    source: str
    view: str
    available: bool = True
    experimental: bool = False


class GameModule(ABC):
    """Pure game logic. QML never needs to know another game's rules."""

    metadata: ModuleMetadata

    def __init__(self, state: dict[str, Any] | None = None) -> None:
        self.state = self.default_state()
        self.restore(state or {})

    @abstractmethod
    def default_state(self) -> dict[str, Any]:
        raise NotImplementedError

    @abstractmethod
    def catalog(self) -> list[dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def generate(self, target: str = "all") -> list[dict[str, Any]]:
        raise NotImplementedError

    @abstractmethod
    def reroll(self, slot_id: str) -> dict[str, Any] | None:
        raise NotImplementedError

    def restore(self, payload: dict[str, Any]) -> None:
        if not isinstance(payload, dict):
            return
        for key in self.state:
            if key in payload:
                self.state[key] = payload[key]

    def serialize(self) -> dict[str, Any]:
        return dict(self.state)

    def descriptor(self) -> dict[str, Any]:
        return asdict(self.metadata)

