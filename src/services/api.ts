import axios from "axios";
import { AnimeThemeDetails, SongInfo } from "../types/index";

/**
 * Pick the best video from all theme entries.
 * Prefers the full, clean OP/ED visual (overlap "None") over overlay/transition versions.
 * If only transition/overlay versions exist, still returns the best available.
 */
function selectBestVideo(entries: any[]): string {
  const candidates = entries.flatMap((entry: any) =>
    (entry.videos || []).map((video: any) => ({ ...video, version: entry.version }))
  );

  if (candidates.length === 0) return "";

  const score = (v: any) => {
    let s = 0;
    // Strongly prefer the full clean visual (no transition/overlay)
    if (v.overlap === "None") s += 100;
    else if (v.overlap === "Over") s += 50;
    // "Transition" gets 0

    // Minor tiebreakers — not requirements
    if (v.nc) s += 10;
    if (v.source === "BD") s += 5;
    if (v.resolution >= 1080) s += 2;
    return s;
  };

  candidates.sort((a: any, b: any) => score(b) - score(a));
  return candidates[0].link || "";
}

const ANIME_THEMES_API_URL = "https://api.animethemes.moe";
// In production, set VITE_BACKEND_URL to your Render deployment URL
// In local dev, leave it empty — Vite proxy handles routing
const SHAZAM_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

// Get artist mappings from localStorage
function getArtistMappings() {
  const mappings = localStorage.getItem("artistMappings");
  return mappings ? JSON.parse(mappings) : {};
}

// Get the mapped artist name from localStorage
function getMappedArtistName(artist: string): string {
  const artistMappings = getArtistMappings();

  // Normalize the artist name by trimming spaces and converting to lowercase
  const normalizedArtist = artist.trim().toLowerCase();

  // Remove any featured artist info, e.g., "SawanoHiroyuki[nZk]:Tielle" -> "SawanoHiroyuki[nZk]"
  const baseArtist = normalizedArtist.split(":")[0];

  // Get the mapped name for the base artist
  const mappedName =
    artistMappings[baseArtist] ||
    artistMappings[normalizedArtist] ||
    baseArtist; // Use baseArtist for final search

  console.log(
    `Original artist name: "${artist}", Normalized artist name: "${normalizedArtist}", Base artist name: "${baseArtist}", Mapped artist name: "${mappedName}"`
  ); // Log the mapping for debugging

  return mappedName;
}

export async function identifySong(audioData: Blob): Promise<SongInfo> {
  const formData = new FormData();
  formData.append("file", audioData, "audio.webm");

  try {
    const response = await axios.post(`${SHAZAM_BACKEND_URL}/recognize`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const result = response.data;

    if (!result.title) {
      throw new Error(result.error || "No song identified");
    }

    const songInfo: SongInfo = {
      title: result.title,
      originalTitle: result.originalTitle,
      artist: result.artist,
      coverArt: result.coverArt || "",
      appleMusicUrl: result.appleMusicUrl || "",
      shazamUrl: result.shazamUrl || "",
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
    // Step 1: Get the mapped artist name from localStorage
    let mappedArtistName = getMappedArtistName(artistName);

    // Step 2: Initial search by full title (ensure lowercase)
    let songSearchResponse = await axios.get(`${ANIME_THEMES_API_URL}/search`, {
      params: {
        "fields[search]": "animethemes",
        q: songTitle.toLowerCase(), // Lowercase for case-insensitivity
      },
    });
    console.log("Song Search Response:", songSearchResponse.data);
    let themes = songSearchResponse.data.search.animethemes;

    // Step 3: Check the artist for each response if themes are found
    if (themes.length > 0) {
      for (const theme of themes) {
        const themeDetailsResponse = await axios.get(
          `${ANIME_THEMES_API_URL}/animetheme/${theme.id}`,
          {
            params: { include: "anime.images,animethemeentries.videos,song.artists" },
          }
        );
        const themeDetails = themeDetailsResponse.data.animetheme;

        // Check if the artist matches the mapped artist name
        if (
          themeDetails.song.artists.some(
            (artist: any) =>
              artist.name.toLowerCase() === mappedArtistName.toLowerCase()
          )
        ) {
          console.log(`Found match: ${themeDetails.song.title}`);
          const animeImage = themeDetails.anime.images?.find((img: any) => img.facet === "Large Cover")?.link
            || themeDetails.anime.images?.find((img: any) => img.facet === "Small Cover")?.link
            || themeDetails.anime.images?.[0]?.link
            || "";
          return {
            artistNames: themeDetails.song.artists.map(
              (artist: any) => artist.name
            ),
            songName: themeDetails.song.title,
            animeName: themeDetails.anime.name,
            animeImage,
            themeType: themeDetails.type,
            sequence: themeDetails.sequence,
            year: themeDetails.anime.year,
            videoLink: selectBestVideo(themeDetails.animethemeentries),
          };
        }
      }
    }

    // Step 4: If no themes found, split the title in half and retry
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

      // Step 5: Check the artist for each response from the partial title search
      for (const theme of themes) {
        const themeDetailsResponse = await axios.get(
          `${ANIME_THEMES_API_URL}/animetheme/${theme.id}`,
          {
            params: { include: "anime.images,animethemeentries.videos,song.artists" },
          }
        );
        const themeDetails = themeDetailsResponse.data.animetheme;

        // Check if the artist matches
        if (
          themeDetails.song.artists.some(
            (artist: any) =>
              artist.name.toLowerCase() === mappedArtistName.toLowerCase()
          )
        ) {
          console.log(`Found match: ${themeDetails.song.title}`);

          const animeImage = themeDetails.anime.images?.find((img: any) => img.facet === "Large Cover")?.link
            || themeDetails.anime.images?.find((img: any) => img.facet === "Small Cover")?.link
            || themeDetails.anime.images?.[0]?.link
            || "";
          return {
            artistNames: themeDetails.song.artists.map(
              (artist: any) => artist.name
            ),
            songName: themeDetails.song.title,
            animeName: themeDetails.anime.name,
            animeImage,
            themeType: themeDetails.type,
            sequence: themeDetails.sequence,
            year: themeDetails.anime.year,
            videoLink: selectBestVideo(themeDetails.animethemeentries),
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
