param([string]$Python = 'python')
$ErrorActionPreference = 'Stop'
& $Python (Join-Path $PSScriptRoot '../ci/prepare_test_databases.py')
if ($LASTEXITCODE -ne 0) { throw 'Disposable database preparation failed' }
