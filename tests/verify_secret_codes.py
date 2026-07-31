"""Focused regression check for secret codes typed into the QML window."""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
os.environ["APPDATA"] = tempfile.mkdtemp(prefix="overroll-secret-qa-")
PROJECT = Path(__file__).resolve().parents[1]
qa_vendor_root = os.environ.get("QA_VENDOR_ROOT", "").strip()
sys.path.insert(0, qa_vendor_root or str(PROJECT / "vendor"))
if qa_vendor_root and hasattr(os, "add_dll_directory"):
    os.add_dll_directory(qa_vendor_root)
    os.add_dll_directory(str(Path(qa_vendor_root) / "PySide6"))
sys.path.insert(0, str(PROJECT))

from PySide6.QtGui import QGuiApplication, QKeyEvent
from PySide6.QtQml import QQmlApplicationEngine
from PySide6.QtCore import QCoreApplication, QEvent, Qt, QUrl
from PySide6.QtTest import QTest

from source.owrp.controller import AppController
from source.owrp.modules import ModuleManager


def type_code(window: object, code: str) -> None:
    for character in code:
        key = getattr(Qt.Key, f"Key_{character}")
        event = QKeyEvent(
            QEvent.Type.KeyPress,
            key,
            Qt.KeyboardModifier.NoModifier,
            character,
        )
        QCoreApplication.sendEvent(window, event)
        QCoreApplication.processEvents()


def main() -> int:
    app = QGuiApplication.instance() or QGuiApplication([])
    controller = AppController(PROJECT)
    controller.audio.configure(False, 0)
    module_manager = ModuleManager(PROJECT, controller.user_root / "data")
    controller.attach_module_manager(module_manager)
    revealed: list[str] = []
    controller.secretRevealed.connect(revealed.append)

    engine = QQmlApplicationEngine()
    engine.rootContext().setContextProperty("appController", controller)
    engine.rootContext().setContextProperty("moduleManager", module_manager)
    engine.rootContext().setContextProperty("localHelperRoot", "")
    engine.rootContext().setContextProperty("localHelperToken", "")
    engine.load(QUrl.fromLocalFile(str(PROJECT / "source/qml/Main.qml")))
    assert engine.rootObjects(), "Main.qml did not load"
    window = engine.rootObjects()[0]
    controller.attach_window(window)
    window.requestActivate()
    QTest.qWait(100)

    type_code(window, "DPS78")
    QTest.qWait(100)
    type_code(window, "FROGGER")
    QTest.qWait(100)

    assert revealed == ["DPS78", "FROGGER"], revealed
    assert controller.secretDps78Unlocked
    assert controller.secretFroggerUnlocked
    assert controller.secretsUnlocked
    print("secret_codes=ok revealed=DPS78,FROGGER")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
