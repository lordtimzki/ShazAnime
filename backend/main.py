import os
import ssl
import certifi
import tempfile

# Fix SSL certificate verification on macOS
os.environ["SSL_CERT_FILE"] = certifi.where()
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from shazamio import Shazam

app = FastAPI()

# Allow CORS from the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

shazam = Shazam()


@app.post("/api/recognize")
async def recognize(file: UploadFile = File(...)):
    """Accept an audio file upload and return song identification results."""
    # Save uploaded audio to a temp file (ShazamIO needs a file path)
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = await shazam.recognize(tmp_path)
    finally:
        os.unlink(tmp_path)

    # Extract track info from Shazam response
    track = result.get("track")
    if not track:
        return {"title": None, "originalTitle": None, "artist": None, "error": "No song identified"}

    title = track.get("title", "")
    artist = track.get("subtitle", "")

    return {
        "title": title,
        "originalTitle": title,
        "artist": artist,
    }
