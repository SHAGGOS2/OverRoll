"""Game modules exposed by OverRoll."""

from typing import Any


__all__ = ["ModuleManager"]


def __getattr__(name: str) -> Any:
    if name == "ModuleManager":
        from .manager import ModuleManager

        return ModuleManager
    raise AttributeError(name)
