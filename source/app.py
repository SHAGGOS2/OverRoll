# -*- coding: utf-8 -*-
"""OverRoll Qt entry point."""

from __future__ import annotations

import os
import sys
import tempfile
import importlib
import gc
from pathlib import Path


SOURCE_DIR = Path(__file__).resolve().parent
PROJECT_DIR = SOURCE_DIR.parent
VENDOR_DIR = (
    PROJECT_DIR / "vendor_build"
    if (PROJECT_DIR / "vendor_build" / "PySide6").exists()
    else PROJECT_DIR / "vendor"
)
if VENDOR_DIR.exists():
    sys.path.insert(0, str(VENDOR_DIR))

os.environ.setdefault("QT_QUICK_CONTROLS_STYLE", "Basic")
os.environ.setdefault("QT_ENABLE_HIGHDPI_SCALING", "1")
os.environ.setdefault("QSG_RENDER_LOOP", "threaded")
os.environ.setdefault("QSG_RENDER_TIMING", "0")

from PySide6.QtCore import QCoreApplication, QTimer, QUrl  # noqa: E402
from PySide6.QtGui import QFont, QFontDatabase, QGuiApplication, QIcon, QPixmapCache  # noqa: E402
from PySide6.QtQml import QQmlApplicationEngine  # noqa: E402
from PySide6.QtQuick import QQuickWindow  # noqa: F401, E402

from source.owrp.controller import AppController  # noqa: E402
from source.owrp.local_helper import LocalHelper  # noqa: E402
from source.owrp.modules import ModuleManager  # noqa: E402
from source.owrp.services.migration import MigrationService  # noqa: E402
from tools import update_snapshot  # noqa: E402


def self_test_log(message: str) -> None:
    if "--self-test" not in sys.argv:
        return
    try:
        path = Path(tempfile.gettempdir()) / "overroll-self-test.log"
        with path.open("a", encoding="utf-8") as stream:
            stream.write(message + "\n")
    except OSError:
        pass


def close_packager_splash() -> None:
    """Close either supported packager splash after the QML window exists."""
    if os.environ.get("_PYI_SPLASH_IPC"):
        try:
            importlib.import_module("pyi_splash").close()
        except Exception:
            pass

    nuitka_parent = os.environ.get("NUITKA_ONEFILE_PARENT", "")
    if nuitka_parent.isdigit():
        feedback = Path(tempfile.gettempdir()) / f"onefile_{nuitka_parent}_splash_feedback.tmp"
        try:
            feedback.unlink(missing_ok=True)
        except OSError:
            pass


def main() -> int:
    if "--update-api-worker" in sys.argv:
        index = sys.argv.index("--update-api-worker")
        expected_root = (Path(os.environ.get("APPDATA", str(PROJECT_DIR))) / "OWRPRenewed").resolve()
        try:
            user_root = Path(sys.argv[index + 1]).resolve()
        except (IndexError, OSError):
            return 2
        if user_root != expected_root:
            print("Ruta de actualizacion rechazada.", flush=True)
            return 2
        try:
            update_snapshot.APP_DIR = user_root
            update_snapshot.OUTPUT_PATH = user_root / "data" / "heroes_snapshot.json"
            update_snapshot.ASSET_DIR = user_root / "data" / "assets"
            update_snapshot.LOCALES = ["en-us", "es-mx", "es-es"]
            update_snapshot.BASE_LOCALE = "en-us"
            update_snapshot.main()
            return 0
        except Exception as exc:
            print(str(exc), flush=True)
            return 1

    QCoreApplication.setOrganizationName("SHAGGOS")
    QCoreApplication.setApplicationName("OverRoll")
    QCoreApplication.setApplicationVersion("2.3.3")

    app = QGuiApplication(sys.argv)
    for font_path in sorted((PROJECT_DIR / "assets" / "fonts").glob("*.ttf")):
        QFontDatabase.addApplicationFont(str(font_path))
    app.setFont(QFont("Open Sans", 10))

    self_test = "--self-test" in sys.argv
    if self_test:
        self_test_log("app ready")
    user_root = Path(os.environ.get("APPDATA", str(PROJECT_DIR))) / "OWRPRenewed"
    MigrationService(user_root / "data").migrate()
    controller = AppController(PROJECT_DIR)
    if self_test:
        controller.audio.configure(False, 0)
    module_manager = ModuleManager(PROJECT_DIR, controller.user_root / "data")
    if self_test:
        self_test_log("models ready")
    controller.attach_module_manager(module_manager)
    helper = LocalHelper(controller.user_root)
    helper.start()
    icon_path = controller.bundled_file("data/assets/app_icon.png")
    if icon_path:
        app.setWindowIcon(QIcon(icon_path))

    engine = QQmlApplicationEngine()
    engine.rootContext().setContextProperty("appController", controller)
    engine.rootContext().setContextProperty("moduleManager", module_manager)
    engine.rootContext().setContextProperty("localHelperRoot", helper.root)
    engine.rootContext().setContextProperty("localHelperToken", helper.token)
    qml_path = SOURCE_DIR / "qml" / "Main.qml"
    engine.load(QUrl.fromLocalFile(str(qml_path)))
    if self_test:
        self_test_log("qml loaded")
    if not engine.rootObjects():
        close_packager_splash()
        return 1

    window = engine.rootObjects()[0]
    if icon_path:
        window.setIcon(QIcon(icon_path))
    controller.attach_window(window)
    trim_timer = QTimer()
    trim_timer.setSingleShot(True)
    trim_timer.setInterval(280)

    def trim_runtime_caches() -> None:
        cache_limits = {"low": 8 * 1024, "medium": 24 * 1024, "high": 64 * 1024}
        QPixmapCache.setCacheLimit(cache_limits.get(controller.performanceMode, 24 * 1024))
        engine.trimComponentCache()
        gc.collect(0)

    trim_timer.timeout.connect(trim_runtime_caches)
    controller.memoryTrimRequested.connect(trim_timer.start)
    trim_runtime_caches()
    self_test_log("before splash close")
    close_packager_splash()
    self_test_log("after splash close")
    app.aboutToQuit.connect(controller.audio.shutdown)
    app.aboutToQuit.connect(controller.flushPendingWrites)
    app.aboutToQuit.connect(module_manager.save)
    app.aboutToQuit.connect(helper.stop)
    if self_test:
        original_game = module_manager.active_id

        def capture_self_test(game_id: str) -> None:
            capture_path = Path(tempfile.gettempdir()) / f"overroll-self-test-{game_id}.png"
            saved = window.grabWindow().save(str(capture_path))
            self_test_log(f"capture {game_id} {saved} {capture_path}")

        def exercise_game(game_id: str) -> None:
            self_test_log(f"game {game_id}")
            module_manager.activate(game_id)
            module_manager.generate("all")
            QTimer.singleShot(260, lambda: capture_self_test(game_id))

        QTimer.singleShot(120, lambda: (self_test_log("settings"), controller.navigate("settings")))
        QTimer.singleShot(420, lambda: (self_test_log("help"), controller.navigate("help")))
        QTimer.singleShot(720, lambda: (self_test_log("result"), controller.navigate("result")))
        game_step = 420
        for offset, game_id in enumerate(module_manager.modules, start=1):
            QTimer.singleShot(
                720 + offset * game_step,
                lambda game_id=game_id: exercise_game(game_id),
            )
        QTimer.singleShot(
            720 + (len(module_manager.modules) + 1) * game_step,
            lambda: module_manager.activate(original_game),
        )
        QTimer.singleShot(
            720 + (len(module_manager.modules) + 2) * game_step,
            lambda: (self_test_log("quit"), app.quit()),
        )
    return app.exec()


if __name__ == "__main__":
    raise SystemExit(main())
