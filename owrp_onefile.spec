# -*- mode: python ; coding: utf-8 -*-

from pathlib import Path


def runtime_only(entry):
    destination = entry[0].replace("\\", "/").lower()
    return (
        "/qt/labs/assetdownloader/" not in destination
        and "/qtquick/shapes/designhelpers/" not in destination
        and "/objects-debug/" not in destination
        and not destination.endswith((".obj", ".cpp"))
    )


def qml_runtime_files():
    qml_root = Path("vendor/PySide6/qml").resolve()
    modules = [
        ("QtQml", True),
        ("QtQuick", False),
        ("QtQuick/Window", True),
        ("QtQuick/Layouts", True),
        ("QtQuick/Templates", True),
        ("QtQuick/Controls", False),
        ("QtQuick/Controls/Basic", True),
        ("QtQuick/Controls/impl", True),
        ("QtQuick/Dialogs", True),
        ("QtQuick/Shapes", True),
        ("Qt/labs/folderlistmodel", True),
    ]
    binaries = []
    datas = []
    seen = set()
    for relative, recursive in modules:
        source_dir = qml_root / relative
        iterator = source_dir.rglob("*") if recursive else source_dir.glob("*")
        for source in iterator:
            source_relative = source.relative_to(qml_root).as_posix().lower()
            if not source.is_file() or source in seen or "/designhelpers/" in f"/{source_relative}":
                continue
            seen.add(source)
            destination = Path("PySide6/qml") / source.relative_to(qml_root).parent
            entry = (str(source), str(destination))
            (binaries if source.suffix.lower() == ".dll" else datas).append(entry)
    return binaries, datas


qml_binaries, qml_datas = qml_runtime_files()


a = Analysis(
    ["main.py"],
    pathex=["vendor"],
    binaries=qml_binaries,
    datas=[("source/qml", "source/qml"), ("data", "data"), ("assets", "assets"), *qml_datas],
    hiddenimports=["PySide6.QtMultimedia"],
    hookspath=["hooks"],
    hooksconfig={},
    runtime_hooks=[],
    excludes=["PySide6.QtWidgets", "PySide6.QtMultimediaWidgets"],
    noarchive=False,
    optimize=0,
)
a.binaries = [entry for entry in a.binaries if runtime_only(entry)]
a.datas = [entry for entry in a.datas if runtime_only(entry)]
pyz = PYZ(a.pure)

splash = Splash(
    "data/assets/splash.png",
    binaries=a.binaries,
    datas=a.datas,
    text_pos=None,
    minify_script=True,
    always_on_top=True,
)

exe = EXE(
    pyz,
    a.scripts,
    splash,
    splash.binaries,
    a.binaries,
    a.datas,
    [],
    name="OverRoll",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    version="version_info.txt",
    icon=["data\\assets\\app_icon.ico"],
)
