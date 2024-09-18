import React, { useEffect, useState } from "react";
import { searchAnimeTheme } from "../services/api";

interface SearchResultsProps {
  songData: {
    result: {
      title: string;
      artist: string;
    };
  };
}

interface AnimeTheme {
  id: string;
  title: string;
  anime: string;
  type: string;
  year: number;
}

export default function SearchResults({ songData }: SearchResultsProps) {
  const [animeThemes, setAnimeThemes] = useState<AnimeTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnimeThemes = async () => {
      try {
        const themes = await searchAnimeTheme({
          title: songData.result.title,
          artist: songData.result.artist,
        });
        setAnimeThemes(themes);
      } catch (err) {
        setError("Failed to fetch anime themes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimeThemes();
  }, [songData]);

  if (loading) return <div>Loading anime themes...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Identified Song</h2>
      <p>Title: {songData.result.title}</p>
      <p>Artist: {songData.result.artist}</p>

      <h2 className="text-2xl font-bold mt-8 mb-4">Matching Anime Themes</h2>
      {animeThemes.length === 0 ? (
        <p>No matching anime themes found.</p>
      ) : (
        <ul className="space-y-4">
          {animeThemes.map((theme) => (
            <li key={theme.id} className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold">{theme.title}</h3>
              <p>Anime: {theme.anime}</p>
              <p>Type: {theme.type}</p>
              <p>Year: {theme.year}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
