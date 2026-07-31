$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$packageRoot = (& py -3.12 -c "from pathlib import Path; import PySide6; print(Path(PySide6.__file__).resolve().parent)").Trim()
if (-not $packageRoot -or -not (Test-Path -LiteralPath (Join-Path $packageRoot "__init__.py"))) {
    throw "PySide6 6.11.1 no esta instalado para Python 3.12."
}
$qmlRoot = Join-Path $packageRoot "qml"
$backupRoot = Join-Path $env:TEMP "OverRoll_QmlFull_$PID"
$discardRoot = Join-Path $env:TEMP "OverRoll_QmlMinimal_$PID"
$buildRoot = Join-Path $env:TEMP "OverRoll_Nuitka_Build_233_security"
$builtExe = Join-Path $buildRoot "OverRoll.exe"
$success = $false

if (-not $qmlRoot.StartsWith($packageRoot, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Ruta QML fuera del paquete PySide6."
}
if ((Test-Path -LiteralPath $backupRoot) -or (Test-Path -LiteralPath $discardRoot)) {
    throw "Ya existe una carpeta temporal de esta compilacion."
}

try {
    Push-Location $projectRoot
    py -3.12 -m nuitka --version | Out-Null

    Move-Item -LiteralPath $qmlRoot -Destination $backupRoot
    New-Item -ItemType Directory -Force $qmlRoot | Out-Null
    Get-ChildItem -LiteralPath $backupRoot -File -Force | Copy-Item -Destination $qmlRoot

    $recursiveModules = @(
        "QtQml",
        "QtQuick\Window",
        "QtQuick\Layouts",
        "QtQuick\Templates",
        "QtQuick\Controls\Basic",
        "QtQuick\Controls\impl",
        "QtQuick\Dialogs",
        "QtQuick\Shapes",
        "Qt\labs\folderlistmodel"
    )
    foreach ($relative in $recursiveModules) {
        $source = Join-Path $backupRoot $relative
        $destination = Join-Path $qmlRoot $relative
        New-Item -ItemType Directory -Force (Split-Path $destination) | Out-Null
        Copy-Item -LiteralPath $source -Destination $destination -Recurse
    }
    foreach ($relative in @("QtQuick", "QtQuick\Controls")) {
        $source = Join-Path $backupRoot $relative
        $destination = Join-Path $qmlRoot $relative
        New-Item -ItemType Directory -Force $destination | Out-Null
        Get-ChildItem -LiteralPath $source -File -Force | Copy-Item -Destination $destination
    }
    $designHelpers = Join-Path $qmlRoot "QtQuick\Shapes\DesignHelpers"
    if (Test-Path -LiteralPath $designHelpers) {
        Remove-Item -LiteralPath $designHelpers -Recurse -Force
    }

    New-Item -ItemType Directory -Force $buildRoot | Out-Null
    Remove-Item Env:PYTHONPATH -ErrorAction SilentlyContinue
    $nuitkaArgs = @(
        "--mode=onefile",
        "--enable-plugin=pyside6",
        "--include-qt-plugins=qml",
        "--include-data-dir=source/qml=source/qml",
        "--include-data-dir=data=data",
        "--include-data-dir=assets/fonts=assets/fonts",
        "--onefile-cache-mode=cached",
        "--onefile-tempdir-spec={CACHE_DIR}/SHAGGOS/OverRoll/2.3.3-external-games",
        "--onefile-no-compression",
        "--onefile-windows-splash-screen-image=data/assets/splash.png",
        "--windows-console-mode=disable",
        "--windows-icon-from-ico=data/assets/app_icon.ico",
        "--company-name=SHAGGOS",
        "--product-name=OverRoll: Random Hero Picker",
        "--file-description=OverRoll: Random Hero Picker",
        "--file-version=2.3.3.0",
        "--product-version=2.3.3.0",
        "--copyright=SHAGGOS / Blizzard assets used by an unofficial fan tool",
        "--output-filename=OverRoll.exe",
        "--output-dir=$buildRoot",
        "--mingw64",
        "--assume-yes-for-downloads",
        "--remove-output",
        "main.py"
    )
    py -3.12 -m nuitka @nuitkaArgs
    if ($LASTEXITCODE -ne 0 -or -not (Test-Path -LiteralPath $builtExe)) {
        throw "Nuitka no creo el ejecutable."
    }
    Copy-Item -LiteralPath $builtExe -Destination (Join-Path $projectRoot "OverRoll.exe") -Force
    $exeHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $projectRoot "OverRoll.exe")).Hash
    $hashLines = @("$exeHash  OverRoll.exe")
    $portableArchive = Join-Path $projectRoot "OverRoll_Portable.zip"
    if (Test-Path -LiteralPath $portableArchive) {
        $portableHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $portableArchive).Hash
        $hashLines += "$portableHash  OverRoll_Portable.zip"
    }
    $hashLines | Set-Content -LiteralPath (Join-Path $projectRoot "CHECKSUMS_SHA256.txt") -Encoding ascii
    $success = $true
}
finally {
    if (Test-Path -LiteralPath $backupRoot) {
        if (Test-Path -LiteralPath $qmlRoot) {
            Move-Item -LiteralPath $qmlRoot -Destination $discardRoot
        }
        Move-Item -LiteralPath $backupRoot -Destination $qmlRoot
    }
    if (Test-Path -LiteralPath $discardRoot) {
        Remove-Item -LiteralPath $discardRoot -Recurse -Force
    }
    Pop-Location
}

if ($success) {
    Write-Host "EXE creado en: $projectRoot\OverRoll.exe"
}
