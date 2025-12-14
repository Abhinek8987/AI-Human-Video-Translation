@echo off
setlocal

REM Run from project root: d:\Human Video Winsurf

if not exist .venv\Scripts\python.exe (
  echo [*] Creating virtual environment...
  py -3 -m venv .venv 2>nul
  if not exist .venv\Scripts\python.exe (
    python -m venv .venv
  )
)

echo [*] Upgrading pip and installing requirements...
".venv\Scripts\python" -m pip install --upgrade pip
".venv\Scripts\python" -m pip install -r backend\requirements.txt

if not exist backend\.env (
  echo [*] Creating backend\.env from example...
  copy /Y backend\.env.example backend\.env >nul
)

echo [*] Starting FastAPI on http://127.0.0.1:8000 ...
".venv\Scripts\python" -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000

endlocal
