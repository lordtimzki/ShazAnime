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
    // Step 1: Search for the song by title
    const songSearchResponse = await axios.get(
      `${ANIME_THEMES_API_URL}/search`,
      {
        params: {
          "fields[search]": "animethemes",
          q: songTitle,
        },
      }
    );
    console.log("Song Search Response:", songSearchResponse.data);
    const themes = songSearchResponse.data.search.animethemes;

    // Step 2: Iterate through the list and fetch detailed information for each theme
    for (const theme of themes) {
      const themeDetailsResponse = await axios.get(
        `${ANIME_THEMES_API_URL}/animetheme/${theme.id}`,
        {
          params: { include: "anime,animethemeentries.videos,song.artists" },
        }
      );
      console.log("Theme Details Response:", themeDetailsResponse.data);
      const themeDetails = themeDetailsResponse.data.animetheme;

      // Step 3: Check if the artist matches the desired artist
      if (
        themeDetails.song.artists.some(
          (artist: any) =>
            artist.name.toLowerCase() === artistName.toLowerCase()
        )
      ) {
        return {
          artistName: themeDetails.song.artists[0].name,
          songName: themeDetails.song.title,
          animeName: themeDetails.anime.name,
          themeType: themeDetails.type,
          sequence: themeDetails.sequence,
          year: themeDetails.anime.year,
          videoLink: themeDetails.animethemeentries[0]?.videos[0]?.link || "",
        };
      }
    }

    throw new Error("Matching theme not found");
  } catch (error) {
    console.error("Error finding anime theme:", error);
    return null;
  }
}
