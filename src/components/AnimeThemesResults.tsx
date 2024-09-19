import React, { useEffect, useState } from "react";
import { searchAnimeTheme } from "../services/api";
import { SongInfo } from "../types";

interface AnimeThemeResultsProps {
  songInfo: SongInfo;
}

interface SearchResult {
  anime: any[];
  animethemes: any[];
  artists: any[];
  songs: any[];
  videos: any[];
}

const AnimeThemeResults: React.FC<AnimeThemeResultsProps> = ({ songInfo }) => {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const data = await searchAnimeTheme(songInfo);
        setSearchResult(data.search);
      } catch (err) {
        setError("Failed to fetch anime themes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [songInfo]);

  if (loading) return <div>Loading anime themes...</div>;
  if (error) return <div>Error: {error}</div>;
  if (
    !searchResult ||
    Object.values(searchResult).every((arr) => arr.length === 0)
  ) {
    return <div>No matching anime themes found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mt-8 mb-4">Matching Anime Themes</h2>
      {searchResult.animethemes.map((theme) => {
        const anime = searchResult.anime.find((a) => a.id === theme.anime_id);
        const song = searchResult.songs.find((s) => s.id === theme.song_id);
        const artists = searchResult.artists.filter(
          (a) => song && song.artist_ids.includes(a.id)
        );

        return (
          <div key={theme.id} className="border p-4 rounded-lg mb-4">
            <h3 className="text-xl font-semibold">
              {theme.type} {theme.sequence}
            </h3>
            <p>Anime: {anime ? anime.name : "Unknown"}</p>
            <p>Song: {song ? song.title : "Unknown"}</p>
            <p>
              Artists:{" "}
              {artists.length > 0
                ? artists.map((a) => a.name).join(", ")
                : "Unknown"}
            </p>
            {theme.animethemeentries.map((entry: any) =>
              entry.videos.map((video: any, videoIndex: number) => (
                <a
                  key={`${entry.id}-${videoIndex}`}
                  href={video.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline mr-2"
                >
                  Watch Theme {entry.version ? `(v${entry.version})` : ""}
                </a>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AnimeThemeResults;
