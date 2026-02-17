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

    # Extract Apple Music web link from hub
    apple_music_url = ""
    hub = track.get("hub", {})

    def find_https_uri(actions):
        """Find the first https:// URI from a list of hub actions."""
        for action in actions:
            uri = action.get("uri", "")
            if uri.startswith("https://"):
                return uri
        return ""

    # 1) hub.options (OPEN / APPLE_MUSIC provider)
    for option in hub.get("options", []):
        apple_music_url = find_https_uri(option.get("actions", []))
        if apple_music_url:
            break
    # 2) hub.providers
    if not apple_music_url:
        for provider in hub.get("providers", []):
            if "apple" in provider.get("type", "").lower():
                apple_music_url = find_https_uri(provider.get("actions", []))
                if apple_music_url:
                    break
    # 3) hub.actions (top-level)
    if not apple_music_url:
        for action in hub.get("actions", []):
            uri = action.get("uri", "")
            if uri.startswith("https://") and "apple" in uri:
                apple_music_url = uri
                break
    # 4) Construct from Apple Music catalog ID (adamid)
    if not apple_music_url:
        adamid = track.get("adamid")
        if adamid:
            apple_music_url = f"https://music.apple.com/song/{adamid}"

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
