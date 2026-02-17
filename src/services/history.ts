import { AnimeThemeDetails } from "../types";

export interface HistoryEntry {
  id: string;
  animeName: string;
  animeImage: string;
  songName: string;
  artistNames: string[];
  themeType: string;
  sequence: number;
  year: number;
  coverArt: string;
  timestamp: number;
}

const HISTORY_KEY = "shazanime_history";

export function getHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(
  details: AnimeThemeDetails,
  coverArt: string
): void {
  const history = getHistory();

  // Avoid duplicates — same anime + same song
  const exists = history.some(
    (h) => h.animeName === details.animeName && h.songName === details.songName
  );
  if (exists) return;

  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    animeName: details.animeName,
    animeImage: details.animeImage,
    songName: details.songName,
    artistNames: details.artistNames,
    themeType: details.themeType,
    sequence: details.sequence,
    year: details.year,
    coverArt: coverArt,
    timestamp: Date.now(),
  };

  history.unshift(entry); // newest first
  // Keep max 50 entries
  if (history.length > 50) history.length = 50;

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/** Group history entries by anime name */
export function getHistoryGroupedByAnime(): {
  animeName: string;
  animeImage: string;
  year: number;
  songs: HistoryEntry[];
}[] {
  const history = getHistory();
  const map = new Map<
    string,
    { animeName: string; animeImage: string; year: number; songs: HistoryEntry[] }
  >();

  for (const entry of history) {
    if (!map.has(entry.animeName)) {
      map.set(entry.animeName, {
        animeName: entry.animeName,
        animeImage: entry.animeImage,
        year: entry.year,
        songs: [],
      });
    }
    map.get(entry.animeName)!.songs.push(entry);
  }

  return Array.from(map.values());
}
