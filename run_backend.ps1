# Run this from the project root: d:\Human Video Winsurf
# Creates venv if missing, installs deps, copies .env, and starts uvicorn on port 8000.

$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$venvPython = Join-Path $projectRoot ".venv/Scripts/python.exe"

if (-Not (Test-Path $venvPython)) {
  Write-Host "[+] Creating virtual environment..."
  py -3 -m venv .venv 2>$null
  if (-Not (Test-Path $venvPython)) {
    python -m venv .venv
  }
}

Write-Host "[+] Upgrading pip and installing requirements..."
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r "$projectRoot/backend/requirements.txt"

$envFile = Join-Path $projectRoot "backend/.env"
if (-Not (Test-Path $envFile)) {
  Write-Host "[+] Creating backend/.env from example..."
  Copy-Item "$projectRoot/backend/.env.example" $envFile -Force
}

Write-Host "[+] Starting FastAPI on http://localhost:8000 ..."
& $venvPython -m uvicorn backend.main:app --reload --port 8000
