import os
import certifi
import tempfile
import httpx

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

ANIME_THEMES_GRAPHQL = "https://graphql.animethemes.moe/"


@app.get("/")
async def health():
    return {"status": "ok"}


@app.post("/animethemes/graphql")
async def animethemes_graphql(body: dict):
    """Proxy GraphQL requests to AnimeThemes API to avoid CORS issues on mobile."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            ANIME_THEMES_GRAPHQL,
            json=body,
            headers={"Content-Type": "application/json"},
            timeout=10.0,
        )
        return resp.json()


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

    # Fetch Spotify link via Odesli (server-side to avoid CORS)
    spotify_url = ""
    try:
        async with httpx.AsyncClient() as client:
            if adamid:
                odesli_url = f"https://api.song.link/v1-alpha.1/links?platform=appleMusic&type=song&id={adamid}"
            elif apple_music_url:
                odesli_url = f"https://api.song.link/v1-alpha.1/links?url={apple_music_url}"
            else:
                odesli_url = None
            if odesli_url:
                resp = await client.get(odesli_url, timeout=8.0)
                if resp.status_code == 200:
                    data = resp.json()
                    spotify_url = data.get("linksByPlatform", {}).get("spotify", {}).get("url", "")
    except Exception:
        pass  # Spotify link is optional

    return {
        "title": title,
        "originalTitle": title,
        "artist": artist,
        "coverArt": cover_art,
        "appleMusicUrl": apple_music_url,
        "appleMusicId": adamid or "",
        "spotifyUrl": spotify_url,
        "shazamUrl": shazam_url,
    }
