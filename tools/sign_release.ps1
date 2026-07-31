param(
    [Parameter(Mandatory = $true)]
    [string]$PfxPath
)

$ErrorActionPreference = "Stop"
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$resolvedPfx = (Resolve-Path -LiteralPath $PfxPath).Path
$password = Read-Host "Contrasena del certificado" -AsSecureString
$flags = [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable
$certificate = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2(
    $resolvedPfx,
    $password,
    $flags
)

if (-not $certificate.HasPrivateKey) {
    throw "El certificado no contiene una clave privada."
}

function Sign-OverRollFile([string]$Path) {
    $signature = Set-AuthenticodeSignature `
        -LiteralPath $Path `
        -Certificate $certificate `
        -HashAlgorithm SHA256 `
        -TimestampServer "http://timestamp.digicert.com"
    if ($signature.Status -ne [System.Management.Automation.SignatureStatus]::Valid) {
        throw "No se pudo validar la firma de $Path`: $($signature.StatusMessage)"
    }
}

$exePath = Join-Path $projectRoot "OverRoll.exe"
$zipPath = Join-Path $projectRoot "OverRoll_Portable.zip"
Sign-OverRollFile $exePath

$workRoot = Join-Path $env:TEMP "OverRoll_Signed_$PID"
try {
    Expand-Archive -LiteralPath $zipPath -DestinationPath $workRoot -Force
    $portableExe = Join-Path $workRoot "OverRoll\OverRoll.exe"
    Sign-OverRollFile $portableExe
    $portableHash = (Get-FileHash -Algorithm SHA256 -LiteralPath $portableExe).Hash
    "SHA256  OverRoll.exe`r`n$portableHash" | Set-Content `
        -LiteralPath (Join-Path $workRoot "OverRoll\CHECKSUM_SHA256.txt") `
        -Encoding ascii
    Compress-Archive -LiteralPath (Join-Path $workRoot "OverRoll") -DestinationPath $zipPath -Force
}
finally {
    if (Test-Path -LiteralPath $workRoot) {
        Remove-Item -LiteralPath $workRoot -Recurse -Force
    }
}

$hashes = foreach ($name in @("OverRoll.exe", "OverRoll_Portable.zip")) {
    $path = Join-Path $projectRoot $name
    "{0}  {1}" -f (Get-FileHash -Algorithm SHA256 -LiteralPath $path).Hash, $name
}
$hashes | Set-Content -LiteralPath (Join-Path $projectRoot "CHECKSUMS_SHA256.txt") -Encoding ascii
Write-Host "EXE y portable firmados correctamente."
