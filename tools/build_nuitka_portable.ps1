$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pysideRoot = (& py -3.12 -c "from pathlib import Path; import PySide6; print(Path(PySide6.__file__).resolve().parent)").Trim()
if (-not $pysideRoot -or -not (Test-Path -LiteralPath (Join-Path $pysideRoot "__init__.py"))) {
    throw "PySide6 6.11.1 no esta instalado para Python 3.12."
}
$qmlRoot = Join-Path $pysideRoot "qml"
$backupRoot = Join-Path $env:TEMP "OverRoll_QmlFull_Portable_$PID"
$discardRoot = Join-Path $env:TEMP "OverRoll_QmlMinimal_Portable_$PID"
$buildRoot = Join-Path $env:TEMP "OverRoll_Nuitka_Portable_233_security"
$packageContainer = Join-Path $buildRoot "package"
$portableRoot = Join-Path $packageContainer "OverRoll"
$archivePath = Join-Path $projectRoot "OverRoll_Portable.zip"
$success = $false

if (-not $qmlRoot.StartsWith($pysideRoot, [StringComparison]::OrdinalIgnoreCase)) {
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
        "--mode=standalone",
        "--enable-plugin=pyside6",
        "--include-qt-plugins=qml",
        "--include-data-dir=source/qml=source/qml",
        "--include-data-dir=data=data",
        "--include-data-dir=assets/fonts=assets/fonts",
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
    if ($LASTEXITCODE -ne 0) {
        throw "Nuitka no creo el portable."
    }

    $distRoot = Get-ChildItem -LiteralPath $buildRoot -Directory | Where-Object { $_.Name -like "*.dist" } | Select-Object -First 1
    if (-not $distRoot -or -not (Test-Path -LiteralPath (Join-Path $distRoot.FullName "OverRoll.exe"))) {
        throw "No se encontro la carpeta standalone terminada."
    }
    if (-not $packageContainer.StartsWith($buildRoot, [StringComparison]::OrdinalIgnoreCase)) {
        throw "Ruta de paquete fuera del directorio temporal."
    }
    if (Test-Path -LiteralPath $packageContainer) {
        Remove-Item -LiteralPath $packageContainer -Recurse -Force
    }
    New-Item -ItemType Directory -Force $portableRoot | Out-Null
    Copy-Item -Path (Join-Path $distRoot.FullName "*") -Destination $portableRoot -Recurse -Force
    Copy-Item -LiteralPath (Join-Path $projectRoot "README.md") -Destination $portableRoot -Force
    Copy-Item -LiteralPath (Join-Path $projectRoot "SEGURIDAD.md") -Destination $portableRoot -Force
    $portableHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $portableRoot "OverRoll.exe")).Hash
    "SHA256  OverRoll.exe`r`n$portableHash" | Set-Content -LiteralPath (Join-Path $portableRoot "CHECKSUM_SHA256.txt") -Encoding ascii
    Compress-Archive -LiteralPath $portableRoot -DestinationPath $archivePath -Force

    $rootHashes = @()
    foreach ($name in @("OverRoll.exe", "OverRoll_Portable.zip")) {
        $path = Join-Path $projectRoot $name
        if (Test-Path -LiteralPath $path) {
            $rootHashes += "{0}  {1}" -f (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash, $name
        }
    }
    $rootHashes | Set-Content -LiteralPath (Join-Path $projectRoot "CHECKSUMS_SHA256.txt") -Encoding ascii
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
    Write-Host "Portable standalone creado en: $archivePath"
}
