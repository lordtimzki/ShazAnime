import os
import certifi
import tempfile

# Fix SSL certificate verification on macOS
os.environ["SSL_CERT_FILE"] = certifi.where()
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from shazamio import Shazam

app = FastAPI()

# Allow CORS from any origin (Vercel frontend calls this Render backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

shazam = Shazam()


@app.get("/")
async def health():
    return {"status": "ok"}


@app.post("/recognize")
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

    # Extract album art from Shazam images
    images = track.get("images", {})
    cover_art = images.get("coverarthq") or images.get("coverart") or ""

    # Extract Apple Music link — use adamid (most reliable)
    apple_music_url = ""
    adamid = track.get("adamid")
    if adamid:
        apple_music_url = f"https://music.apple.com/song/{adamid}"
    else:
        # Fallback: search hub for a real music.apple.com URL
        hub = track.get("hub", {})
        for option in hub.get("options", []):
            for action in option.get("actions", []):
                uri = action.get("uri", "")
                if "music.apple.com" in uri:
                    apple_music_url = uri
                    break
            if apple_music_url:
                break

    # Shazam web URL
    shazam_url = track.get("url", "")

    return {
        "title": title,
        "originalTitle": title,
        "artist": artist,
        "coverArt": cover_art,
        "appleMusicUrl": apple_music_url,
        "shazamUrl": shazam_url,
    }
