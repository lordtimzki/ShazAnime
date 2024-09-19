import axios from "axios";
import { SongInfo } from "../types/index";

const AUDD_API_URL = "https://api.audd.io/";
const AUDD_API_TOKEN = "d9326b0b75862bb67e64af7b59698446";
const ANIME_THEMES_API_URL = "https://api.animethemes.moe";

interface AnimeThemeDetails {
  artistName: string;
  songName: string;
  animeName: string;
  themeType: string;
  sequence: number;
  year: number;
  videoLink: string;
}

export async function identifySong(audioData: Blob): Promise<SongInfo> {
  const formData = new FormData();
  formData.append("file", audioData, "audio.webm");
  formData.append("return", "apple_music,spotify");
  formData.append("api_token", AUDD_API_TOKEN);

  try {
    const response = await axios.post(AUDD_API_URL, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const result = response.data.result;

    const songInfo: SongInfo = {
      title: result.apple_music?.name || result.title, // Prioritize English title
      originalTitle: result.title,
      artist: result.artist,
      // ... other fields
    };

    return songInfo;
  } catch (error) {
    console.error("Error identifying song:", error);
    throw error;
  }
}

export async function searchAnimeTheme(songInfo: SongInfo): Promise<any> {
  try {
    const response = await axios.get(`${ANIME_THEMES_API_URL}/search`, {
      params: {
        q: `${songInfo.title}`,
        include:
          "animethemes.animethemeentries.videos,animethemes.song,animethemes.song.artists",
      },
    });
    console.log("AnimeThemes API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error searching for anime theme:", error);
    throw error;
  }
}

export async function findAnimeTheme(
  artistName: string,
  songTitle: string
): Promise<AnimeThemeDetails | null> {
  try {
    // Step 1: Find the artist
    const artistSearchResponse = await axios.get(
      `${ANIME_THEMES_API_URL}/search`,
      {
        params: {
          "fields[search]": "artists",
          q: artistName,
        },
      }
    );
    const artistSlug = artistSearchResponse.data.search.artists[0]?.slug;
    if (!artistSlug) throw new Error("Artist not found");

    // Step 2: Get artist's songs
    const artistSongsResponse = await axios.get(
      `${ANIME_THEMES_API_URL}/artist/${artistSlug}`,
      {
        params: { include: "songs" },
      }
    );
    const song = artistSongsResponse.data.artist.songs.find(
      (s: any) => s.title.toLowerCase() === songTitle.toLowerCase()
    );
    if (!song) throw new Error("Song not found");

    // Step 3: Get anime theme details
    const themeDetailsResponse = await axios.get(
      `${ANIME_THEMES_API_URL}/animetheme/${song.id}`,
      {
        params: { include: "anime,animethemeentries.videos,song.artists" },
      }
    );
    const themeDetails = themeDetailsResponse.data.animetheme;

    return {
      artistName: themeDetails.song.artists[0].name,
      songName: themeDetails.song.title,
      animeName: themeDetails.anime.name,
      themeType: themeDetails.type,
      sequence: themeDetails.sequence,
      year: themeDetails.anime.year,
      videoLink: themeDetails.animethemeentries[0]?.videos[0]?.link || "",
    };
  } catch (error) {
    console.error("Error finding anime theme:", error);
    return null;
  }
}
