import axios from "axios";
import { AnimeThemeDetails, SongInfo } from "../types/index";
import artistMappingsJson from "../artistMappings.json";
import songMappingsJson from "../songMappings.json";

/**
 * Pick the best video from all theme entries (GraphQL shape).
 * Prefers the full, clean OP/ED visual (overlap "NONE") over overlay/transition versions.
 * If only transition/overlay versions exist, still returns the best available.
 */
function selectBestVideo(entries: any[]): string {
  const candidates = entries.flatMap((entry: any) =>
    (entry.videos?.edges || []).map((edge: any) => ({
      ...edge.node,
      version: entry.version,
    }))
  );

  if (candidates.length === 0) return "";

  const score = (v: any) => {
    let s = 0;
    if (v.overlap === "NONE") s += 100;
    else if (v.overlap === "OVER") s += 50;

    if (v.nc) s += 10;
    if (v.source === "BD") s += 5;
    if (v.resolution >= 1080) s += 2;
    return s;
  };

  candidates.sort((a: any, b: any) => score(b) - score(a));
  return candidates[0].link || "";
}

// In production, set VITE_BACKEND_URL to your Render deployment URL
// In local dev, leave it empty — Vite proxy handles routing
const SHAZAM_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
// AnimeThemes GraphQL calls are proxied through our backend to avoid CORS issues on mobile
const ANIME_THEMES_GRAPHQL_URL = `${SHAZAM_BACKEND_URL}/animethemes/graphql`;

const SEARCH_QUERY = `
  query SearchThemes($search: String!) {
    search(search: $search, first: 10) {
      animethemes {
        id type sequence
        song {
          title
          performances {
            artist {
              ... on Artist { name }
              ... on Membership { group { name } member { name } }
            }
          }
        }
        anime {
          name year
          images { edges { node { facet link } } }
        }
        animethemeentries {
          version
          videos { edges { node { link overlap nc source resolution } } }
        }
      }
    }
  }
`;

async function searchThemes(title: string): Promise<any[]> {
  const response = await axios.post(ANIME_THEMES_GRAPHQL_URL, {
    query: SEARCH_QUERY,
    variables: { search: title.toLowerCase() },
  });
  console.log("Song Search Response:", response.data);
  return response.data.data?.search?.animethemes || [];
}

const artistMappings: Record<string, string> = artistMappingsJson;
const songMappings: Record<string, { title: string; artist?: string }> = songMappingsJson;

function getMappedArtistName(artist: string): string {
  const normalizedArtist = artist.trim().toLowerCase();
  // Remove featured artist info, e.g., "SawanoHiroyuki[nZk]:Tielle" -> "SawanoHiroyuki[nZk]"
  const baseArtist = normalizedArtist.split(":")[0];

  const mappedName =
    artistMappings[baseArtist] ||
    artistMappings[normalizedArtist] ||
    baseArtist;

  console.log(`Artist mapping: "${artist}" → "${mappedName}"`);
  return mappedName;
}

/** Returns the mapped song title if one exists (optionally constrained by artist). */
function getMappedSongTitle(title: string, artist: string): string | null {
  const key = title.trim().toLowerCase();
  const mapping = songMappings[key];
  if (!mapping) return null;
  // If the mapping specifies an artist, only apply it when the artist matches
  if (mapping.artist && !artist.toLowerCase().includes(mapping.artist.toLowerCase())) return null;
  console.log(`Song mapping: "${title}" → "${mapping.title}"`);
  return mapping.title;
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
      appleMusicId: result.appleMusicId || "",
      spotifyUrl: result.spotifyUrl || "",
      shazamUrl: result.shazamUrl || "",
    };

    return songInfo;
  } catch (error) {
    console.error("Error identifying song:", error);
    throw error;
  }
}

/** Get all artist names from a performance (handles both Artist and Membership types) */
function getPerformanceNames(artist: any): string[] {
  if (!artist) return [];
  // Artist type has name directly
  if (artist.name) return [artist.name];
  // Membership type has group.name and member.name
  const names: string[] = [];
  if (artist.group?.name) names.push(artist.group.name);
  if (artist.member?.name) names.push(artist.member.name);
  return names;
}

/** Extract AnimeThemeDetails from a GraphQL theme result */
function themeToDetails(theme: any): AnimeThemeDetails {
  const images = (theme.anime.images?.edges || []).map((e: any) => e.node);
  const animeImage =
    images.find((img: any) => img.facet === "LARGE_COVER")?.link ||
    images.find((img: any) => img.facet === "SMALL_COVER")?.link ||
    images[0]?.link ||
    "";

  return {
    artistNames: (theme.song?.performances || []).flatMap(
      (p: any) => getPerformanceNames(p.artist)
    ),
    songName: theme.song?.title || "",
    animeName: theme.anime.name,
    animeImage,
    themeType: theme.type,
    sequence: theme.sequence,
    year: theme.anime.year,
    videoLink: selectBestVideo(theme.animethemeentries),
  };
}

/** Check if any artist in a theme matches the mapped artist name */
function themeMatchesArtist(theme: any, mappedArtistName: string): boolean {
  const target = mappedArtistName.toLowerCase();
  return (theme.song?.performances || []).some(
    (p: any) => getPerformanceNames(p.artist).some(
      (name) => name.toLowerCase() === target
    )
  );
}

export async function findAnimeTheme(
  artistName: string,
  songTitle: string
): Promise<AnimeThemeDetails | null> {
  try {
    const mappedArtistName = getMappedArtistName(artistName);
    const mappedSongTitle = getMappedSongTitle(songTitle, artistName) ?? songTitle;

    // Search by full title — GraphQL returns all nested data in one query
    let themes = await searchThemes(mappedSongTitle);

    // Check artist match across all results
    for (const theme of themes) {
      if (themeMatchesArtist(theme, mappedArtistName)) {
        console.log(`Found match: ${theme.song?.title}`);
        return themeToDetails(theme);
      }
    }

    // Fallback 1: retry with first half of title (helps with concatenated titles like "Senakaawase")
    const halfIndex = Math.floor(mappedSongTitle.length / 2);
    const partialTitle = mappedSongTitle.slice(0, halfIndex);
    if (partialTitle.length >= 3) {
      console.log(
        `No match found. Retrying with partial title: "${partialTitle}"`
      );

      themes = await searchThemes(partialTitle);

      for (const theme of themes) {
        if (themeMatchesArtist(theme, mappedArtistName)) {
          console.log(`Found match: ${theme.song?.title}`);
          return themeToDetails(theme);
        }
      }
    }

    // Fallback 2: search by artist name
    console.log(
      `Still no match. Retrying with artist name: "${mappedArtistName}"`
    );
    themes = await searchThemes(mappedArtistName);

    for (const theme of themes) {
      if (themeMatchesArtist(theme, mappedArtistName)) {
        // Also check if the song title loosely matches
        const themeTitle = (theme.song?.title || "").toLowerCase();
        const searchTitle = mappedSongTitle.toLowerCase();
        if (
          themeTitle.includes(searchTitle) ||
          searchTitle.includes(themeTitle) ||
          themeTitle.replace(/\s+/g, "").includes(searchTitle.replace(/\s+/g, ""))
        ) {
          console.log(`Found match via artist search: ${theme.song?.title}`);
          return themeToDetails(theme);
        }
      }
    }

    throw new Error("Matching theme not found");
  } catch (error) {
    console.error("Error finding anime theme:", error);
    return null;
  }
}
