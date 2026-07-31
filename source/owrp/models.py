from __future__ import annotations

from typing import Any

from PySide6.QtCore import QAbstractListModel, QModelIndex, QObject, Qt, QSortFilterProxyModel


class DictListModel(QAbstractListModel):
    """A small list model that updates rows in place when their identity is stable."""

    def __init__(self, roles: tuple[str, ...], identity: str, parent: QObject | None = None) -> None:
        super().__init__(parent)
        self._role_names = roles
        self._role_ids = {name: Qt.UserRole + index + 1 for index, name in enumerate(roles)}
        self._role_lookup = {value: key for key, value in self._role_ids.items()}
        self._identity = identity
        self._items: list[dict[str, Any]] = []

    def roleNames(self) -> dict[int, bytes]:
        return {role_id: name.encode("utf-8") for name, role_id in self._role_ids.items()}

    def rowCount(self, parent: QModelIndex = QModelIndex()) -> int:
        return 0 if parent.isValid() else len(self._items)

    def data(self, index: QModelIndex, role: int = Qt.DisplayRole) -> Any:
        if not index.isValid() or not 0 <= index.row() < len(self._items):
            return None
        name = self._role_lookup.get(role)
        return self._items[index.row()].get(name) if name else None

    def item(self, row: int) -> dict[str, Any] | None:
        return self._items[row] if 0 <= row < len(self._items) else None

    def items(self) -> list[dict[str, Any]]:
        return self._items

    def index_of(self, identity: Any) -> int:
        return next(
            (row for row, item in enumerate(self._items) if item.get(self._identity) == identity),
            -1,
        )

    def replace(self, items: list[dict[str, Any]]) -> None:
        stable = (
            len(items) == len(self._items)
            and all(old.get(self._identity) == new.get(self._identity) for old, new in zip(self._items, items))
        )
        if not stable:
            self.beginResetModel()
            self._items = items
            self.endResetModel()
            return
        for row, new_item in enumerate(items):
            old_item = self._items[row]
            changed_roles = [
                role_id
                for name, role_id in self._role_ids.items()
                if old_item.get(name) != new_item.get(name)
            ]
            if not changed_roles:
                continue
            self._items[row] = new_item
            model_index = self.index(row, 0)
            self.dataChanged.emit(model_index, model_index, changed_roles)

    def update_row(self, row: int, item: dict[str, Any]) -> None:
        if not 0 <= row < len(self._items):
            return
        old_item = self._items[row]
        changed_roles = [
            role_id
            for name, role_id in self._role_ids.items()
            if old_item.get(name) != item.get(name)
        ]
        if not changed_roles:
            return
        self._items[row] = item
        model_index = self.index(row, 0)
        self.dataChanged.emit(model_index, model_index, changed_roles)

    def refresh_row(self, row: int, roles: tuple[str, ...] | None = None) -> None:
        if not 0 <= row < len(self._items):
            return
        model_index = self.index(row, 0)
        role_ids = [self._role_ids[name] for name in roles or self._role_names if name in self._role_ids]
        self.dataChanged.emit(model_index, model_index, role_ids)


PLAYER_ROLES = (
    "playerIndex",
    "name",
    "tank",
    "damage",
    "support",
    "profileId",
    "profileName",
    "profileInitial",
)

PICK_ROLES = (
    "pickIndex",
    "team",
    "playerIndex",
    "playerName",
    "profileName",
    "profileTag",
    "heroKey",
    "heroName",
    "role",
    "roleName",
    "subrole",
    "subroleName",
    "portrait",
    "roleIcon",
    "largeRoleIcon",
    "subroleIcon",
    "accent",
    "perkCount",
    "perk0Name",
    "perk0Description",
    "perk0Icon",
    "perk1Name",
    "perk1Description",
    "perk1Icon",
    "perk2Name",
    "perk2Description",
    "perk2Icon",
    "perk3Name",
    "perk3Description",
    "perk3Icon",
    "rolesOnly",
    "pinned",
    "revision",
)

PROFILE_HERO_ROLES = (
    "key",
    "name",
    "game",
    "role",
    "roleName",
    "subrole",
    "portrait",
    "bucket",
    "baseKey",
    "baseName",
    "owned",
    "favorite",
    "blocked",
)


class TeamProxyModel(QSortFilterProxyModel):
    def __init__(self, team: int, parent: QObject | None = None) -> None:
        super().__init__(parent)
        self.team = team
        self.setDynamicSortFilter(True)

    def filterAcceptsRow(self, source_row: int, source_parent: QModelIndex) -> bool:
        source = self.sourceModel()
        if source is None:
            return False
        item = source.item(source_row)  # type: ignore[attr-defined]
        return bool(item and int(item.get("team") or 1) == self.team)
