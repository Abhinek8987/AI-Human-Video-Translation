# Human Video Translator – AI-based Multilingual Video Conversion System

This repository contains a full-stack web application that allows users to upload a human video and receive a translated, lip-synced, and subtitled version in a selected target language. This scaffold is production-ready in structure and demo-ready using mocked AI services. You can later plug in real AI backends (Whisper, Wav2Lip, TTS, etc.).

Project structure:

- `backend/` FastAPI service with routes for upload, processing, status, preview, download, subtitles, and mock AI services
- `frontend/` React + Vite + Tailwind UI with pages for Auth, Upload, Status, Preview/Download, Dashboard

Quick start:

Backend
1. Create a Python venv, then install requirements
   - Windows (PowerShell)
     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     pip install -r backend/requirements.txt
     ```
2. Copy `.env.example` to `.env` and update if needed
   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```
3. Run the API
   ```powershell
   uvicorn backend.main:app --reload --port 8000
   ```

Frontend
1. Install Node 18+
2. Install dependencies
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

Configure environment
- Backend env file: `backend/.env`
- Frontend env file: `frontend/.env` (optional; see `frontend/src/config.ts`)

Demo flow
1. Sign in (mock) on the frontend
2. Upload a video and select a target language
3. The job will process (mocked) and generate:
   - 5-second preview
   - Subtitles `.srt` and `.vtt`
   - Downloadable translated video (mock file)
4. Check Dashboard for history and metrics

Integrate real AI backends later by implementing the interfaces in `backend/services/ai/` and toggling via env variables.

Security and privacy
- Files are stored locally in `backend/storage/` and auto-deleted after job completion (configurable)
- Replace with S3 by implementing `S3StorageService` placeholder

Roadmap and optional features
- Background noise removal (open-source denoiser)
- Speaker diarization (pyannote)
- Auto summarization (LLM)
- Sign language avatar (avatar SDK)

License
- For academic evaluation and demonstration.
