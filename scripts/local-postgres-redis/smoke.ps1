param([string]$ProjectName = ("knowi-local-" + [guid]::NewGuid().ToString('N').Substring(0, 12)))
$ErrorActionPreference = 'Stop'
if ($ProjectName -notmatch '^knowi-local-[a-z0-9-]+$') { throw 'Use an isolated knowi-local-* project name' }
$composeFile = Join-Path $PSScriptRoot '../../deploy/local-postgres-redis/compose.yaml'
function Invoke-Compose {
    & docker compose --project-name $ProjectName --file $composeFile @args
    if ($LASTEXITCODE -ne 0) { throw "Compose failed with exit code $LASTEXITCODE" }
}
try {
    Invoke-Compose up --build --wait --wait-timeout 180 core
    Invoke-Compose run --rm --no-deps smoke
    Invoke-Compose run --rm --no-deps worker
    Invoke-Compose images
} finally {
    & docker compose --project-name $ProjectName --file $composeFile down --remove-orphans
}
