import os
import certifi
import tempfile

# Fix SSL certificate verification on macOS/Linux
os.environ["SSL_CERT_FILE"] = certifi.where()

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from shazamio import Shazam

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

shazam = Shazam()


@app.post("/api/recognize")
async def recognize(file: UploadFile = File(...)):
    """Accept an audio file upload and return song identification results."""
    suffix = os.path.splitext(file.filename or "audio.webm")[1] or ".webm"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        contents = await file.read()
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        result = await shazam.recognize(tmp_path)
    finally:
        os.unlink(tmp_path)

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
