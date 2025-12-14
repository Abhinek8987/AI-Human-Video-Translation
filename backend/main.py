import os
import asyncio
import uuid
from datetime import datetime, timedelta
from typing import Dict, Optional, List
import tempfile
import shutil

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import httpx
try:
    # Optional: real media handling
    import moviepy.editor as mp
    from gtts import gTTS
    HAS_MEDIA = True
except Exception:
    HAS_MEDIA = False
try:
    # Optional: Coqui XTTS voice cloning (requires torch installed)
    from TTS.api import TTS as CoquiTTS  # type: ignore
    HAS_XTTS = True
except Exception:
    HAS_XTTS = False
try:
    # Optional: real STT + translation
    from openai import OpenAI
    from googletrans import Translator
    HAS_OPENAI = True
except Exception:
    HAS_OPENAI = False
try:
    # Local STT (no API key)
    from faster_whisper import WhisperModel  # type: ignore
    HAS_LOCAL_WHISPER = True
except Exception:
    HAS_LOCAL_WHISPER = False

# Simple in-memory stores for demo
JOBS: Dict[str, dict] = {}

# Map to gTTS language codes where they differ
GTTS_LANG_MAP = {
    "zh": "zh-CN",
    # Map Indian languages where supported by gTTS; others will fallback to 'en'
    "bn": "bn", "gu": "gu", "hi": "hi", "kn": "kn", "ml": "ml", "mr": "mr",
    "ne": "ne", "or": "or", "pa": "pa", "ta": "ta", "te": "te", "ur": "ur",
    # Additional global (supported by gTTS)
    "pt": "pt", "it": "it", "ru": "ru", "tr": "tr", "fa": "fa", "sw": "sw",
    "id": "id", "th": "th", "vi": "vi", "ms": "ms", "nl": "nl", "pl": "pl",
    "el": "el", "he": "he", "sv": "sv", "da": "da", "fi": "fi", "ro": "ro",
    "hu": "hu", "es": "es", "fr": "fr", "de": "de", "ja": "ja", "ko": "ko",
    "ar": "ar",
    # Note: gTTS does not have a dedicated "no" (Norwegian) code; will fallback to 'en'
}
    # Some may be unsupported by gTTS: as, brx, doi, ks, gom, mai, mni, sa, sat, sd
USERS: Dict[str, dict] = {}
HISTORY: Dict[str, list] = {}

APP_ENV = os.getenv("APP_ENV", "development")
STORAGE_DIR = os.getenv("STORAGE_DIR", os.path.join("backend", "storage"))
LIPSYNC_BACKEND = os.getenv("AI_LIPSYNC_BACKEND", "mock").lower()

# CORS configuration
if APP_ENV.lower() == "development":
    CORS_ORIGINS = ["*"]
else:
    cors_env = os.getenv("CORS_ORIGINS", "")
    CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
    if not CORS_ORIGINS:
        CORS_ORIGINS = ["*"]  # Fallback for production

AUTO_DELETE = os.getenv("AUTO_DELETE", "true").lower() == "true"

# Ensure storage directory exists
os.makedirs(STORAGE_DIR, exist_ok=True)

os.makedirs(STORAGE_DIR, exist_ok=True)

app = FastAPI(title=os.getenv("APP_NAME", "Human Video Translator API"))
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=False if CORS_ORIGINS == ["*"] else True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    user_id: str


class UploadResponse(BaseModel):
    job_id: str
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float
    message: Optional[str] = None


SUPPORTED_LANGUAGES = [
    # Global set
    "en", "hi", "fr", "es", "de", "ta", "ja", "ko", "zh", "ar",
    # Additional requested global languages
    "pt", "it", "ru", "tr", "fa", "sw", "id", "th", "vi", "ms",
    "nl", "pl", "el", "he", "sv", "no", "da", "fi", "ro", "hu",
    # India (requested)
    "as", "bn", "brx", "doi", "gu", "kn", "ks", "gom", "mai", "ml",
    "mni", "mr", "ne", "or", "pa", "sa", "sat", "sd", "te", "ur",
    # Additional country-specific languages
    "ps", "sq", "ber", "ca", "hy", "az", "be", "bs", "hr", "sr",
    "tn", "my", "cs", "dv", "nl", "dz", "et", "fj", "fil", "gl",
    "ka", "kl", "rn", "ht", "hu", "is", "ga", "jv", "kk", "km",
    "rw", "lo", "lt", "lb", "mk", "mg", "ms", "mt", "mi", "mn",
    "na", "om", "pap", "qu", "quz", "ro", "rm", "sm", "st", "sn",
    "sl", "so", "nr", "ss", "tl", "tg", "to", "tk", "uk", "uz",
    "xh", "zu", "ny", "ve", "ts", "ss", "nso", "tn", "tso", "ven",
    "xho", "zul",
    # Additional languages from user request
    "ab", "aa", "av", "ae", "ak", "ay", "bm", "bi", "ho", "ig",
    "ik", "kw", "cu", "ce", "eo", "gv", "ln", "mh", "mo", "nd",
    "ng", "pi", "sg", "su", "ty", "vo", "wa", "yi", "za",
    # Additional languages from second request
    "haw", "ku", "yo", "ha", "am", "bo", "hmn", "bho", "hne",
    "gbm", "kfy", "mag", "mwr", "tcy", "awa", "bgc", "anp"
]

LANG_LABELS = {
    # Global set
    "en": "English", "hi": "Hindi", "fr": "French", "es": "Spanish", "de": "German",
    "ta": "Tamil", "ja": "Japanese", "ko": "Korean", "zh": "Chinese", "ar": "Arabic",
    
    # Country-specific languages
    "ps": "Pashto", "sq": "Albanian", "ber": "Berber (Tamazight)", "ca": "Catalan", 
    "hy": "Armenian", "az": "Azerbaijani", "be": "Belarusian", "bs": "Bosnian", 
    "hr": "Croatian", "sr": "Serbian", "tn": "Tswana", "my": "Burmese", 
    "cs": "Czech", "dv": "Divehi", "nl": "Dutch", "dz": "Dzongkha", 
    "et": "Estonian", "fj": "Fijian", "fil": "Filipino", "gl": "Galician",
    "ka": "Georgian", "kl": "Greenlandic", "rn": "Kirundi", "ht": "Haitian Creole",
    "hu": "Hungarian", "is": "Icelandic", "ga": "Irish", "jv": "Javanese",
    "kk": "Kazakh", "km": "Khmer", "rw": "Kinyarwanda", "lo": "Lao",
    "lt": "Lithuanian", "lb": "Luxembourgish", "mk": "Macedonian", "mg": "Malagasy",
    "ms": "Malay", "mt": "Maltese", "mi": "Māori", "mn": "Mongolian",
    "na": "Nauruan", "om": "Oromo", "pap": "Papiamento", "qu": "Quechua",
    "quz": "Cusco Quechua", "ro": "Romanian", "rm": "Romansh", "sm": "Samoan",
    "st": "Sesotho", "sn": "Shona", "sl": "Slovenian", "so": "Somali",
    "nr": "South Ndebele", "ss": "Swazi", "tl": "Tagalog", "tg": "Tajik",
    "to": "Tongan", "tk": "Turkmen", "uk": "Ukrainian", "uz": "Uzbek",
    "xh": "Xhosa", "zu": "Zulu", "ny": "Chichewa", "ve": "Venda",
    "ts": "Tsonga", "nso": "Northern Sotho", "tso": "Xitsonga", "ven": "Tshivenda",
    # Additional language labels
    "ab": "Abkhazian", "aa": "Afar", "av": "Avaric", "ae": "Avestan",
    "ak": "Akan", "ay": "Aymara", "bm": "Bambara", "bi": "Bislama",
    "ho": "Hiri Motu", "ig": "Igbo", "ik": "Inupiaq", "kw": "Cornish",
    "cu": "Church Slavonic", "ce": "Chechen", "eo": "Esperanto",
    "gv": "Manx", "ln": "Lingala", "mh": "Marshallese",
    "mo": "Moldovan (Moldavian)", "nd": "North Ndebele",
    "ng": "Ndonga", "pi": "Pāli", "sg": "Sango",
    "su": "Sundanese", "ty": "Tahitian", "vo": "Volapük",
    "wa": "Walloon", "yi": "Yiddish", "za": "Zhuang",
    # Additional language labels from second request
    "haw": "Hawaiian", "ku": "Kurdish", "yo": "Yoruba", "ha": "Hausa",
    "am": "Amharic", "bo": "Tibetan", "hmn": "Hmong", "bho": "Bhojpuri",
    "hne": "Chhattisgarhi", "gbm": "Garhwali", "kfy": "Kumaoni",
    "mag": "Magahi", "mwr": "Marwari", "tcy": "Tulu", "awa": "Awadhi",
    "bgc": "Haryanvi", "anp": "Angika",
    # Additional global
    "pt": "Portuguese (Português)",
    "it": "Italian (Italiano)",
    "ru": "Russian (Русский)",
    "tr": "Turkish (Türkçe)",
    "fa": "Persian (Farsi) (فارسی)",
    "sw": "Swahili (Kiswahili)",
    "id": "Indonesian (Bahasa Indonesia)",
    "th": "Thai (ไทย)",
    "vi": "Vietnamese (Tiếng Việt)",
    "ms": "Malay (Bahasa Melayu)",
    "nl": "Dutch (Nederlands)",
    "pl": "Polish (Polski)",
    "el": "Greek (Ελληνικά)",
    "he": "Hebrew (עברית)",
    "sv": "Swedish (Svenska)",
    "no": "Norwegian (Norsk)",
    "da": "Danish (Dansk)",
    "fi": "Finnish (Suomi)",
    "ro": "Romanian (Română)",
    "hu": "Hungarian (Magyar)",
    # India
    "as": "Assamese (অসমীয়া)",
    "bn": "Bengali (বাংলা)",
    "brx": "Bodo (बर’/बड़ो)",
    "doi": "Dogri (डोगरी)",
    "gu": "Gujarati (ગુજરાતી)",
    "kn": "Kannada (ಕನ್ನಡ)",
    "ks": "Kashmiri (کأشُر / کشمیری)",
    "gom": "Konkani (कोंकणी)",
    "mai": "Maithili (मैथिली)",
    "ml": "Malayalam (മലയാളം)",
    "mni": "Manipuri / Meitei (মৈতৈলोन্ / মণিপুরী)",
    "mr": "Marathi (मराठी)",
    "ne": "Nepali (नेपाली)",
    "or": "Odia (ଓଡ଼ିଆ)",
    "pa": "Punjabi (ਪੰਜਾਬੀ)",
    "sa": "Sanskrit (संस्कृतम्)",
    "sat": "Santali (ᱥᱟᱱᱛᱟᱲᱤ)",
    "sd": "Sindhi (سنڌي / सिंधी)",
    "te": "Telugu (తెలుగు)",
    "ur": "Urdu (اردو)",
}


@app.get("/health")
async def health():
    return {"status": "ok", "time": datetime.utcnow().isoformat() + "Z"}


@app.post("/auth/mock-login", response_model=LoginResponse)
async def mock_login(req: LoginRequest):
    user_id = USERS.get(req.email, {}).get("user_id")
    if not user_id:
        user_id = str(uuid.uuid4())
        USERS[req.email] = {"user_id": user_id, "email": req.email}
        HISTORY[user_id] = []
    # Return a fake token (do not use in production)
    token = f"mock-{user_id}"
    return LoginResponse(token=token, user_id=user_id)


@app.get("/languages")
async def languages():
    options = [{"code": c, "label": LANG_LABELS.get(c, c)} for c in SUPPORTED_LANGUAGES]
    # Sort by label for nicer dropdown order
    options.sort(key=lambda x: x["label"].lower())
    return {"languages": SUPPORTED_LANGUAGES, "options": options}


@app.post("/upload", response_model=UploadResponse)
async def upload_video(
    file: UploadFile = File(...),
    target_language: str = Form(...),
    user_id: str = Form(...),
    voice_sample: UploadFile | None = File(None),
):
    if target_language not in SUPPORTED_LANGUAGES:
        raise HTTPException(status_code=400, detail="Unsupported target language")

    job_id = str(uuid.uuid4())
    job_dir = os.path.join(STORAGE_DIR, job_id)
    os.makedirs(job_dir, exist_ok=True)

    src_path = os.path.join(job_dir, f"source_{file.filename}")
    # Stream copy instead of reading whole file into memory
    import shutil
    file.file.seek(0)
    with open(src_path, "wb") as f:
        shutil.copyfileobj(file.file, f, length=1024 * 1024)

    voice_path = None
    if voice_sample is not None:
        voice_path = os.path.join(job_dir, f"voice_{voice_sample.filename}")
        import shutil as _sh
        try:
            voice_sample.file.seek(0)
            with open(voice_path, "wb") as vf:
                _sh.copyfileobj(voice_sample.file, vf, length=1024 * 512)
        except Exception:
            voice_path = None

    JOBS[job_id] = {
        "job_id": job_id,
        "user_id": user_id,
        "status": "queued",
        "progress": 0.0,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "target_language": target_language,
        "paths": {
            "source": src_path,
            "preview": os.path.join(job_dir, "preview.mp4"),
            "output": os.path.join(job_dir, "translated.mp4"),
            "srt": os.path.join(job_dir, "subtitles.srt"),
            "vtt": os.path.join(job_dir, "subtitles.vtt"),
            "voice": voice_path or "",
        },
    }

    # Start background processing
    asyncio.create_task(_process_job(job_id))

    return UploadResponse(job_id=job_id, message="Upload received. Processing started.")


# Lightweight one-shot translation endpoint for the Chrome extension
@app.post("/live_translate")
async def live_translate(
    file: UploadFile = File(...),
    lang: str = Form(...),
):
    """
    Accepts a video/audio file and a target language code `lang`, returns an MP3 of translated speech.
    Form fields: file, lang
    """
    # Persist upload to a temp path
    tmp_dir = tempfile.mkdtemp()
    src_path = os.path.join(tmp_dir, f"upload_{file.filename}")
    file.file.seek(0)
    with open(src_path, "wb") as f:
        shutil.copyfileobj(file.file, f, length=1024 * 1024)

    # Prepare a mono 16k WAV for STT
    wav_path = None
    try:
        ctype = (file.content_type or "").lower()
        if ctype.startswith("video/"):
            # Use existing utility to extract audio
            wav_path = await _extract_audio(src_path)
        else:
            # Audio input: normalize to 16k mono WAV using librosa
            import librosa, soundfile as sf
            y, sr = librosa.load(src_path, sr=16000, mono=True)
            wav_path = os.path.join(tmp_dir, "audio.wav")
            sf.write(wav_path, y, 16000)
    except Exception:
        # As a last resort, try moviepy for any input type
        if HAS_MEDIA:
            try:
                clip = mp.AudioFileClip(src_path)
                wav_path = os.path.join(tmp_dir, "audio.wav")
                clip.write_audiofile(wav_path, fps=16000, nbytes=2, codec="pcm_s16le", verbose=False, logger=None)
                clip.close()
            except Exception:
                pass
    if not wav_path or not os.path.exists(wav_path):
        raise HTTPException(status_code=400, detail="Failed to prepare audio for transcription")

    # Transcribe
    full_text = None
    segs = None
    try:
        full_text, segs, detected = await _transcribe_local_whisper(wav_path) or (None, None, None)
    except Exception:
        full_text = None
    if not full_text:
        raise HTTPException(status_code=500, detail="Transcription failed")

    # Translate (whole text as a single block)
    translated = await _translate_text(full_text, lang) or full_text

    # Synthesize TTS (single-shot)
    try:
        tts_path = await _synthesize_tts([translated], lang)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS failed: {e}")

    # Return as MP3
    if not os.path.exists(tts_path):
        raise HTTPException(status_code=500, detail="TTS output missing")
    return FileResponse(tts_path, media_type="audio/mpeg", filename="translated.mp3")


async def _process_job(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        return
    try:
        job["status"] = "processing"
        job["progress"] = 0.1
        job["message"] = "Starting processing"

        # Prefer real STT + translation when possible
        translated_lines: List[str] | None = None
        segments_for_subs: List[tuple] | None = None  # (start, end, text)
        detected_src_lang: Optional[str] = None
        if HAS_MEDIA:
            try:
                # 1) Extract audio from the uploaded video
                audio_path = await _extract_audio(job["paths"]["source"])  # wav temp path, 16k mono
                # Save extracted source audio for potential voice cloning reference
                job.setdefault("paths", {})["source_audio"] = audio_path
                # 2) Transcribe: prefer local faster-whisper first (no API key), fall back to OpenAI if available
                text, segs, detected_src_lang = await _transcribe_local_whisper(audio_path) or (None, None, None)
                if not text:
                    text = await _transcribe_openai(audio_path)
                # 3) Translate to target language (per segment if available)
                if text:
                    if segs:
                        tr_lines: List[str] = []
                        tr_segs: List[tuple] = []
                        for (st, en, tx) in segs:
                            ttx = await _translate_text(tx, job["target_language"], src_lang=detected_src_lang) or tx
                            if ttx.strip() == tx.strip():
                                job["message"] = "Primary translator returned source; used fallback or kept original."
                            tr_lines.append(ttx)
                            tr_segs.append((st, en, ttx))
                        translated_lines = tr_lines
                        segments_for_subs = tr_segs
                    else:
                        translated_text = await _translate_text(text, job["target_language"], src_lang=detected_src_lang) or text
                        if translated_text.strip() == text.strip():
                            job["message"] = "Primary translator returned source; used fallback or kept original."
                        translated_lines = _split_to_sentences(translated_text)
                    if not translated_lines:
                        job["message"] = "Translation returned empty; kept original text."
                    else:
                        job["message"] = "Transcription and translation complete"
                else:
                    job["message"] = "Transcription unavailable (no API key or error). Using demo lines."
            except Exception:
                translated_lines = None
                job["message"] = "Transcription pipeline error. Using demo lines."
        else:
            job["message"] = "Media libraries unavailable. Using mock outputs."

        # If real pipeline unavailable, use demo lines in target language
        if not translated_lines:
            translated_lines = _demo_translation_text(job["target_language"])  # placeholder

        await asyncio.sleep(0.3)
        job["progress"] = 0.3  # STT + translation ready
        if segments_for_subs:
            await _write_segment_subtitles(job["paths"]["srt"], job["paths"]["vtt"], segments_for_subs)
        else:
            await _write_demo_subtitles(job["paths"]["srt"], job["paths"]["vtt"], translated_lines, lang=job["target_language"])

        await asyncio.sleep(0.3)
        job["progress"] = 0.6  # TTS
        tts_path = None
        if HAS_MEDIA:
            try:
                # Synthesize speech from translated lines (per-segment when available)
                tts_path = await _synthesize_tts(
                    translated_lines,
                    job["target_language"],
                    segments=segments_for_subs,
                    voice_sample=(job["paths"].get("voice") or job["paths"].get("source_audio") or None),
                )
                job["message"] = "TTS synthesized"
            except Exception:
                tts_path = None
                job["message"] = "TTS failed (possibly offline). Using mock video."

        await asyncio.sleep(0.3)
        job["progress"] = 0.85  # Mux audio + preview (or lipsync + mux)

        # Optional: Wav2Lip for better lip sync
        source_for_mux = job["paths"]["source"]
        if LIPSYNC_BACKEND == "wav2lip" and HAS_MEDIA and tts_path:
            try:
                lipsynced_path = await _run_wav2lip(source_for_mux, tts_path)
                if lipsynced_path and os.path.exists(lipsynced_path):
                    source_for_mux = lipsynced_path
                    job["message"] = "Wav2Lip lipsync complete"
            except Exception:
                job["message"] = "Wav2Lip unavailable/failed, falling back to normal mux"

        if HAS_MEDIA and tts_path:
            try:
                await _mux_with_video(
                    source_video=source_for_mux,
                    tts_audio=tts_path,
                    preview_out=job["paths"]["preview"],
                    final_out=job["paths"]["output"],
                )
                job["message"] = "Muxing complete"
                job["status"] = "completed"

                # Record in HISTORY for Dashboard
                try:
                    user_id = job.get("user_id") or "guest"
                    if user_id not in HISTORY:
                        HISTORY[user_id] = []
                    # Derive duration from source video
                    duration_sec = 0
                    try:
                        clip = mp.VideoFileClip(job["paths"]["source"])
                        duration_sec = int(clip.duration or 0)
                        clip.close()
                    except Exception:
                        pass
                    # Estimate words from translated lines
                    words = 0
                    try:
                        if translated_lines:
                            words = len(" ".join(translated_lines).split())
                    except Exception:
                        pass
                    HISTORY[user_id].append({
                        "job_id": job_id,
                        "target_language": job.get("target_language"),
                        "created_at": job.get("created_at"),
                        "duration_sec": duration_sec,
                        "words": words,
                        "status": job.get("status", "completed"),
                    })
                except Exception:
                    pass
            except Exception:
                # Fallback to mock if moviepy/ffmpeg fails
                await _write_mock_video(job["paths"]["preview"], duration_sec=5)
                await _write_mock_video(job["paths"]["output"], duration_sec=10)
                job["message"] = "Muxing failed (ffmpeg?). Using mock files."
                job["status"] = "failed"
                # Record failed job
                try:
                    user_id = job.get("user_id") or "guest"
                    if user_id not in HISTORY:
                        HISTORY[user_id] = []
                    HISTORY[user_id].append({
                        "job_id": job_id,
                        "target_language": job.get("target_language"),
                        "created_at": job.get("created_at"),
                        "duration_sec": 0,
                        "words": 0,
                        "status": "failed",
                    })
                except Exception:
                    pass
        else:
            await _write_mock_video(job["paths"]["preview"], duration_sec=5)
            await _write_mock_video(job["paths"]["output"], duration_sec=10)
            if not HAS_MEDIA:
                job["message"] = "Media libs missing. Using mock files."

        job["progress"] = 1.0
        job["status"] = "completed"

        # Update history
        HISTORY.get(job["user_id"], []).append({
            "job_id": job_id,
            "target_language": job["target_language"],
            "created_at": job["created_at"],
            "duration_sec": 10,
            "words": 42,
            "status": job["status"],
        })

        if AUTO_DELETE:
            # Schedule auto-delete in background after some time
            asyncio.create_task(_auto_delete_job(job_id, delay_seconds=600))
    except Exception as e:
        job["status"] = "failed"
        job["message"] = str(e)


async def _write_mock_video(path: str, duration_sec: int = 5):
    # Write a minimal MP4-like placeholder to allow download. Not a real playable video.
    content = f"MOCK_MP4 duration={duration_sec}s".encode("utf-8")
    with open(path, "wb") as f:
        f.write(content)


async def _write_mock_subtitles(srt_path: str, vtt_path: str, lang: str):
    srt = """1\n00:00:00,000 --> 00:00:02,000\nHello (mock).\n\n2\n00:00:02,000 --> 00:00:05,000\nThis is a translated subtitle ({lang}).\n""".replace("{lang}", lang)
    vtt = """WEBVTT\n\n00:00.000 --> 00:02.000\nHello (mock).\n\n00:02.000 --> 00:05.000\nThis is a translated subtitle ({lang}).\n""".replace("{lang}", lang)
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write(srt)
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write(vtt)


def _demo_translation_text(lang: str) -> List[str]:
    # A few demo lines per language for TTS and subtitles. These are short to keep TTS fast.
    label = LANG_LABELS.get(lang, lang)
    lines = {
        "en": [
            "Hello, this is a demo translation.",
            "Your video has been processed successfully.",
        ],
        "hi": [
            "नमस्ते, यह एक डेमो अनुवाद है।",
            "आपका वीडियो सफलतापूर्वक प्रोसेस हो गया है।",
        ],
        "fr": ["Bonjour, ceci est une traduction de démonstration.", "Votre vidéo a été traitée avec succès."],
        "es": ["Hola, esta es una traducción de demostración.", "Su video se ha procesado correctamente."],
        "de": ["Hallo, dies ist eine Demo-Übersetzung.", "Ihr Video wurde erfolgreich verarbeitet."],
        "ta": ["வணக்கம், இது ஒரு டெமோ மொழிபெயர்ப்பு.", "உங்கள் வீடியோ வெற்றிகரமாக செயலாக்கப்பட்டது."],
        "ja": ["こんにちは、これはデモ翻訳です。", "あなたの動画は正常に処理されました。"],
        "ko": ["안녕하세요, 이것은 데모 번역입니다.", "영상이 성공적으로 처리되었습니다."],
        "zh": ["你好，这是一段演示翻译。", "你的视频已成功处理。"],
        "ar": ["مرحبًا، هذه ترجمة تجريبية.", "تمت معالجة الفيديو بنجاح."],
    }
    return lines.get(lang, [f"Hello, this is a demo translation in {label}."])


async def _synthesize_tts(lines: List[str], lang: str, segments: Optional[List[tuple]] = None, voice_sample: Optional[str] = None) -> str:
    """Synthesize TTS audio.
    If segments provided (list of (start, end, text)), synthesize per segment and concatenate
    in order with tiny silences to better align with subtitle timings.
    Returns path to a single MP3 file.
    """
    tmp_dir = tempfile.mkdtemp()
    gtts_lang = GTTS_LANG_MAP.get(lang, lang)
    supported = {
        "en","hi","fr","es","de","ta","ja","ko","zh-CN","ar",
        "pt","it","ru","tr","fa","sw","id","th","vi","ms","nl","pl","el","he","sv","da","fi","ro","hu",
        "bn","gu","kn","ml","mr","ne","or","pa","te"
    }
    if gtts_lang not in supported:
        gtts_lang = "en"

    # Try XTTS voice cloning if available and a voice sample is provided
    if HAS_XTTS and voice_sample and os.path.exists(voice_sample):
        try:
            model_name = os.getenv("XTTS_MODEL", "tts_models/multilingual/multi-dataset/xtts_v2")
            xtts = CoquiTTS(model_name)
            if segments and len(segments) > 0:
                seg_files = []
                for (st, en, tx) in segments:
                    seg_out = os.path.join(tmp_dir, f"xtts_{int(st*1000)}.wav")
                    lang_code = GTTS_LANG_MAP.get(lang, lang)
                    xtts.tts_to_file(text=tx, file_path=seg_out, speaker_wav=voice_sample, language=lang_code)
                    seg_files.append((st, en, seg_out))
                # Replace segments list to reuse duration matching + concatenation below
                segments = [(st, en, f"__FILE__::{fp}") for (st, en, fp) in seg_files]
            else:
                whole_out = os.path.join(tmp_dir, "xtts_full.wav")
                lang_code = GTTS_LANG_MAP.get(lang, lang)
                xtts.tts_to_file(text="\n".join(lines), file_path=whole_out, speaker_wav=voice_sample, language=lang_code)
                return whole_out
        except Exception:
            # fall back to gTTS path below
            pass

    if segments and len(segments) > 0:
        # Per-segment TTS, then concatenate
        clips = []
        try:
            for (st, en, tx) in segments:
                # Allow pre-generated XTTS files via __FILE__:: protocol
                prefile = None
                if isinstance(tx, str) and tx.startswith("__FILE__::"):
                    prefile = tx.replace("__FILE__::", "", 1)
                if prefile and os.path.exists(prefile):
                    clip = mp.AudioFileClip(prefile)
                else:
                    seg_mp3 = os.path.join(tmp_dir, f"seg_{int(st*1000)}.mp3")
                    tts = gTTS(text=tx, lang=gtts_lang)
                    tts.save(seg_mp3)
                    clip = mp.AudioFileClip(seg_mp3)
                # Duration match with simple time-stretch when possible
                try:
                    import librosa, soundfile as sf
                    target_dur = max(en - st, 0.3)
                    y, sr = librosa.load(seg_mp3, sr=44100)
                    cur = max(len(y) / sr, 0.001)
                    rate = max(min(cur / target_dur, 3.0), 0.33)
                    y2 = librosa.effects.time_stretch(y, rate)
                    out_wav = os.path.join(tmp_dir, f"seg_{int(st*1000)}_stretch.wav")
                    sf.write(out_wav, y2, 44100)
                    clip.close()
                    clip = mp.AudioFileClip(out_wav)
                except Exception:
                    pass
                clips.append(clip)
                # small silence between segments to avoid cutting
                silence = mp.AudioClip(lambda t: 0, duration=0.08, fps=44100)
                clips.append(silence)
            # Concatenate all
            from moviepy.audio.AudioClip import concatenate_audioclips
            concat = concatenate_audioclips(clips)
            out_mp3 = os.path.join(tmp_dir, "tts_concat.mp3")
            concat.write_audiofile(out_mp3, fps=44100, nbytes=2, codec="mp3", verbose=False, logger=None)
            # Close clips
            for c in clips:
                try:
                    c.close()
                except Exception:
                    pass
            return out_mp3
        except Exception:
            # Fall back to single-shot TTS below
            for c in clips:
                try:
                    c.close()
                except Exception:
                    pass

    # Single-shot TTS
    text = "\n".join(lines)
    out_mp3 = os.path.join(tmp_dir, "tts.mp3")
    tts = gTTS(text=text, lang=gtts_lang)
    tts.save(out_mp3)
    return out_mp3


async def _mux_with_video(source_video: str, tts_audio: str, preview_out: str, final_out: str):
    # Load video, replace audio with synthesized track, export final and 5s preview
    clip = mp.VideoFileClip(source_video)
    audio = mp.AudioFileClip(tts_audio)
    # Trim or loop audio to match video length for demo
    if audio.duration < clip.duration:
        audio = mp.concatenate_audioclips([audio, mp.AudioFileClip(tts_audio)]) if audio.duration > 0 else audio
    clip = clip.set_audio(audio)
    # Write final video
    clip.write_videofile(final_out, codec="libx264", audio_codec="aac", fps=clip.fps or 24, verbose=False, logger=None)
    # Write preview (first 5 seconds or less)
    p_dur = min(5, clip.duration or 5)
    clip.subclip(0, p_dur).write_videofile(preview_out, codec="libx264", audio_codec="aac", fps=clip.fps or 24, verbose=False, logger=None)
    clip.close()


async def _write_demo_subtitles(srt_path: str, vtt_path: str, lines: List[str], lang: str):
    # Generate simple 2-second chunks per line
    srt_lines = []
    vtt_lines = ["WEBVTT", ""]
    start = 0.0
    idx = 1
    for line in lines:
        end = start + 2.0
        # SRT format
        srt_lines.append(str(idx))
        srt_lines.append(f"{_fmt_srt_time(start)} --> {_fmt_srt_time(end)}")
        srt_lines.append(line)
        srt_lines.append("")
        # VTT format
        vtt_lines.append(f"{_fmt_vtt_time(start)} --> {_fmt_vtt_time(end)}")
        vtt_lines.append(line)
        vtt_lines.append("")
        start = end
        idx += 1
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_lines))
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(vtt_lines))


def _fmt_srt_time(t: float) -> str:
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = int(t % 60)
    ms = int((t - int(t)) * 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def _fmt_vtt_time(t: float) -> str:
    h = int(t // 3600)
    m = int((t % 3600) // 60)
    s = int(t % 60)
    ms = int((t - int(t)) * 1000)
    return f"{h:02}:{m:02}:{s:02}.{ms:03}"


async def _run_wav2lip(source_video: str, tts_audio: str) -> Optional[str]:
    """Run optional Wav2Lip inference via external script if configured.
    Requires:
      - environment WAV2LIP_REPO_PATH pointing to a local clone of Wav2Lip
      - environment WAV2LIP_MODEL_PATH pointing to the pretrained checkpoint (.pth)
    Returns output video path or None on failure.
    """
    repo = os.getenv("WAV2LIP_REPO_PATH")
    model = os.getenv("WAV2LIP_MODEL_PATH")
    if not repo or not model or not os.path.exists(repo) or not os.path.exists(model):
        return None
    out_dir = tempfile.mkdtemp()
    out_path = os.path.join(out_dir, "lipsynced.mp4")
    # Typical Wav2Lip CLI
    # python inference.py --checkpoint_path <model> --face <source> --audio <tts> --outfile <out>
    import sys, subprocess
    py = sys.executable
    cmd = [
        py,
        os.path.join(repo, "inference.py"),
        "--checkpoint_path", model,
        "--face", source_video,
        "--audio", tts_audio,
        "--outfile", out_path,
    ]
    try:
        subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        return out_path if os.path.exists(out_path) else None
    except Exception:
        return None


async def _extract_audio(source_video: str) -> str:
    """Extract audio from source video to a temporary 16kHz mono PCM WAV file."""
    tmp_dir = tempfile.mkdtemp()
    out_wav = os.path.join(tmp_dir, "audio.wav")
    clip = mp.VideoFileClip(source_video)
    if clip.audio is None:
        # create a silent track to avoid failures
        import numpy as np
        from moviepy.audio.AudioClip import AudioArrayClip
        arr = np.zeros((int(16000*1), 1))  # 1s silence
        aclip = AudioArrayClip(arr, fps=16000)
        clip = clip.set_audio(aclip)
    clip.audio.write_audiofile(out_wav, fps=16000, nbytes=2, codec="pcm_s16le", verbose=False, logger=None)
    clip.close()
    return out_wav


async def _transcribe_openai(audio_path: str) -> Optional[str]:
    """Transcribe audio using OpenAI Whisper if OPENAI_API_KEY is present; returns text or None."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not (HAS_OPENAI and api_key):
        return None
    try:
        client = OpenAI(api_key=api_key)
        with open(audio_path, "rb") as f:
            resp = client.audio.transcriptions.create(
                model="whisper-1",
                file=f,
                response_format="text",
            )
        return str(resp)
    except Exception:
        return None


_LOCAL_WHISPER_MODEL = None
_WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "tiny").strip()  # tiny, base, small, medium, large


async def _transcribe_local_whisper(audio_path: str) -> Optional[tuple[str, List[tuple], Optional[str]]]:
    """Transcribe audio locally using faster-whisper if available; returns (text, segments, lang) or None.
    segments: list of (start, end, text), lang is ISO-639-1 code if available.
    """
    if not (HAS_LOCAL_WHISPER and HAS_MEDIA):
        return None
    try:
        global _LOCAL_WHISPER_MODEL
        if _LOCAL_WHISPER_MODEL is None:
            # Use a small model by default for speed; configurable via env
            _LOCAL_WHISPER_MODEL = WhisperModel(_WHISPER_MODEL_SIZE, device="cpu", compute_type="int8")
        segments, info = _LOCAL_WHISPER_MODEL.transcribe(audio_path, beam_size=1)
        seg_list = []
        full_text_parts = []
        for seg in segments:
            if getattr(seg, "text", None) is None:
                continue
            st = float(getattr(seg, "start", 0.0) or 0.0)
            en = float(getattr(seg, "end", st + 1.0) or (st + 1.0))
            tx = seg.text.strip()
            if tx:
                seg_list.append((st, en, tx))
                full_text_parts.append(tx)
        full_text = " ".join(full_text_parts).strip()
        if not full_text:
            return None
        lang = None
        try:
            lang = getattr(info, 'language', None)
            if isinstance(lang, str) and len(lang) > 2:
                # map long codes if needed, e.g., zh -> zh-CN
                lang = lang[:2]
        except Exception:
            lang = None
        return full_text, seg_list, lang
    except Exception:
        return None


async def _write_segment_subtitles(srt_path: str, vtt_path: str, segments: List[tuple]):
    srt_lines = []
    vtt_lines = ["WEBVTT", ""]
    for idx, (st, en, tx) in enumerate(segments, start=1):
        srt_lines.append(str(idx))
        srt_lines.append(f"{_fmt_srt_time(st)} --> {_fmt_srt_time(en)}")
        srt_lines.append(tx)
        srt_lines.append("")

        vtt_lines.append(f"{_fmt_vtt_time(st)} --> {_fmt_vtt_time(en)}")
        vtt_lines.append(tx)
        vtt_lines.append("")
    with open(srt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(srt_lines))
    with open(vtt_path, "w", encoding="utf-8") as f:
        f.write("\n".join(vtt_lines))


async def _translate_text(text: str, target_language: str, src_lang: Optional[str] = None) -> Optional[str]:
    """Translate text to target language; try googletrans, then MyMemory, then LibreTranslate.
    src_lang: optional ISO code of source language to avoid 'AUTO' issues.
    """
    lang = GTTS_LANG_MAP.get(target_language, target_language)
    # If source not provided, attempt light detection via googletrans
    if not src_lang:
        try:
            trd = Translator()
            det = trd.detect(text)
            if det and getattr(det, 'lang', None):
                src_lang = det.lang
        except Exception:
            src_lang = None
    def _norm(s: str) -> str:
        return " ".join(s.strip().lower().split())

    src_norm = _norm(text)
    # 1) googletrans with small retry
    for _ in range(2):
        try:
            tr = Translator()
            res = tr.translate(text, dest=lang, src=src_lang or 'auto')
            if res and isinstance(res.text, str) and res.text.strip():
                if _norm(res.text) != src_norm:
                    return res.text
        except Exception:
            await asyncio.sleep(0.2)
    # 2) MyMemory fallback (simple, rate limited)
    for _ in range(2):
        try:
            src = (src_lang or 'en').lower()
            if src == 'auto':
                src = 'en'
            q = text.strip()
            if not q:
                return None
            url = 'https://api.mymemory.translated.net/get'
            async with httpx.AsyncClient(timeout=10) as client:
                r = await client.get(url, params={"q": q, "langpair": f"{src}|{lang}"})
                if r.status_code == 200:
                    data = r.json()
                    t = data.get('responseData', {}).get('translatedText')
                    # Guard against MyMemory error texts leaking as "translation"
                    if t and isinstance(t, str) and t.strip() and 'INVALID SOURCE LANGUAGE' not in t.upper():
                        if _norm(t) != src_norm:
                            return t
        except Exception:
            await asyncio.sleep(0.2)
    # 3) LibreTranslate public instance fallback (no API key). Note: rate-limited, best-effort.
    for _ in range(2):
        try:
            q = text.strip()
            if not q:
                return None
            # Use environment override if provided
            base = os.getenv('LIBRETRANSLATE_URL', 'https://libretranslate.de').rstrip('/')
            url = f"{base}/translate"
            payload = {"q": q, "source": src_lang or "auto", "target": lang, "format": "text"}
            headers = {"Accept": "application/json"}
            async with httpx.AsyncClient(timeout=20) as client:
                r = await client.post(url, json=payload, headers=headers)
                if r.status_code == 200:
                    data = r.json()
                    t = data.get('translatedText')
                    if t and isinstance(t, str) and t.strip():
                        if _norm(t) != src_norm:
                            return t
        except Exception:
            await asyncio.sleep(0.2)

    # 4) Clause-level translation attempt if whole sentence failed
    import re
    parts = re.split(r"([,;:\-–—]|\s{2,})", text)
    rebuilt: List[str] = []
    for part in parts:
        p = part.strip()
        if not p or len(p) < 2:
            rebuilt.append(part)
            continue
        # Try googletrans quickly per clause
        try:
            tr = Translator()
            res = tr.translate(p, dest=lang, src=src_lang or 'auto')
            if res and isinstance(res.text, str) and res.text.strip() and _norm(res.text) != _norm(p):
                rebuilt.append(res.text)
                continue
        except Exception:
            pass
        # Fallback: leave as-is if still unchanged
        rebuilt.append(part)
    candidate = "".join(rebuilt).strip()
    if candidate and _norm(candidate) != src_norm:
        return candidate
    return None


def _split_to_sentences(text: str) -> List[str]:
    # Naive split by punctuation; keep it short for TTS and subtitles
    import re
    parts = re.split(r"(?<=[.!?])\s+", text.strip())
    # Filter and limit
    lines = [p.strip() for p in parts if p.strip()]
    # If too long, truncate to a few lines for demo
    return lines[:6] if len(lines) > 6 else lines


async def _auto_delete_job(job_id: str, delay_seconds: int = 600):
    await asyncio.sleep(delay_seconds)
    job = JOBS.get(job_id)
    if not job:
        return
    # Delete files
    for p in job.get("paths", {}).values():
        try:
            if os.path.exists(p):
                os.remove(p)
        except Exception:
            pass
    # Try to remove directory
    try:
        job_dir = os.path.dirname(job["paths"]["output"])
        if os.path.exists(job_dir) and not os.listdir(job_dir):
            os.rmdir(job_dir)
    except Exception:
        pass


@app.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def job_status(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobStatusResponse(
        job_id=job_id, status=job["status"], progress=job.get("progress", 0.0), message=job.get("message")
    )


@app.get("/preview/{job_id}")
async def preview(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    path = job["paths"]["preview"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Preview not ready")
    return FileResponse(path, media_type="video/mp4", filename="preview.mp4")


@app.get("/download/{job_id}")
async def download(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    path = job["paths"]["output"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="File not ready")
    return FileResponse(path, media_type="video/mp4", filename="translated.mp4")


@app.get("/subtitles/{job_id}.srt")
async def download_srt(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    path = job["paths"]["srt"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="SRT not ready")
    return FileResponse(path, media_type="text/plain", filename="subtitles.srt")


@app.get("/subtitles/{job_id}.vtt")
async def download_vtt(job_id: str):
    job = JOBS.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    path = job["paths"]["vtt"]
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="VTT not ready")
    return FileResponse(path, media_type="text/vtt", filename="subtitles.vtt")


@app.get("/dashboard/{user_id}")
async def dashboard(user_id: str):
    # Support empty or missing user ids by mapping to 'guest'
    uid = user_id or "guest"
    items = HISTORY.get(uid, [])
    total_videos = len(items)
    total_words = sum(i.get("words", 0) for i in items)
    total_time = sum(i.get("duration_sec", 0) for i in items)
    return {
        "total_videos": total_videos,
        "total_words": total_words,
        "total_time_sec": total_time,
        "history": items[-20:],
    }
