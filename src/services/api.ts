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
        q: `${songInfo.title.toLowerCase()}`, // Always lowercase
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
    // Step 1: Initial search by full title (ensure lowercase)
    let songSearchResponse = await axios.get(`${ANIME_THEMES_API_URL}/search`, {
      params: {
        "fields[search]": "animethemes",
        q: songTitle.toLowerCase(), // Lowercase for case-insensitivity
      },
    });
    console.log("Song Search Response:", songSearchResponse.data);
    let themes = songSearchResponse.data.search.animethemes;

    // Step 2: Check the artist for each response if themes are found
    if (themes.length > 0) {
      for (const theme of themes) {
        const themeDetailsResponse = await axios.get(
          `${ANIME_THEMES_API_URL}/animetheme/${theme.id}`,
          {
            params: { include: "anime,animethemeentries.videos,song.artists" },
          }
        );
        const themeDetails = themeDetailsResponse.data.animetheme;

        // Check if the artist matches
        if (
          themeDetails.song.artists.some(
            (artist: any) =>
              artist.name.toLowerCase() === artistName.toLowerCase()
          )
        ) {
          console.log(`Found match: ${themeDetails.song.title}`);
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
    }

    // Step 3: If no themes found, split the title in half and retry
    if (themes.length === 0) {
      const halfIndex = Math.floor(songTitle.length / 2); // Floor division to split title in half
      const partialTitle = songTitle.slice(0, halfIndex).toLowerCase(); // Use the first half and lowercase it
      console.log(
        `No themes found. Retrying with partial title: "${partialTitle}"`
      );

      // Retry search with the first half of the title
      const partialSearchResponse = await axios.get(
        `${ANIME_THEMES_API_URL}/search`,
        {
          params: {
            "fields[search]": "animethemes",
            q: partialTitle, // Search using the partial title
          },
        }
      );
      console.log(
        `Retry Search Response for partial title "${partialTitle}":`,
        partialSearchResponse.data
      );
      themes = partialSearchResponse.data.search.animethemes;

      // Step 4: Check the artist for each response from the partial title search
      for (const theme of themes) {
        const themeDetailsResponse = await axios.get(
          `${ANIME_THEMES_API_URL}/animetheme/${theme.id}`,
          {
            params: { include: "anime,animethemeentries.videos,song.artists" },
          }
        );
        const themeDetails = themeDetailsResponse.data.animetheme;

        // Check if the artist matches
        if (
          themeDetails.song.artists.some(
            (artist: any) =>
              artist.name.toLowerCase() === artistName.toLowerCase()
          )
        ) {
          console.log(`Found match: ${themeDetails.song.title}`);
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
    }

    throw new Error("Matching theme not found");
  } catch (error) {
    console.error("Error finding anime theme:", error);
    return null;
  }
}
