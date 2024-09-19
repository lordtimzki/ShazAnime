import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { searchAnimeTheme } from "../services/api";
import { SongInfo } from "../types"; // Make sure to create this type file if you haven't already

const SearchResults: React.FC = () => {
  const [themes, setThemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const songData = location.state?.songData as SongInfo;

  useEffect(() => {
    const fetchThemes = async () => {
      if (!songData) {
        setError("No song data available");
        setLoading(false);
        return;
      }

      try {
        const themesData = await searchAnimeTheme(songData);
        setThemes(themesData.resources || []);
      } catch (err) {
        setError("Failed to fetch anime themes");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemes();
  }, [songData]);

  if (loading) return <div>Loading anime themes...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!songData) return <div>No song data available</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Results</h1>
      <div>
        <h2 className="text-2xl font-bold mb-4">Identified Song</h2>
        <p>Title: {songData.title}</p>
        {songData.title !== songData.originalTitle && (
          <p>Original Title: {songData.originalTitle}</p>
        )}
        <p>Artist: {songData.artist}</p>
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Matching Anime Themes</h2>
      {themes.length === 0 ? (
        <p>No matching anime themes found.</p>
      ) : (
        <ul className="space-y-4">
          {themes.map((theme: any) => (
            <li key={theme.id} className="border p-4 rounded-lg">
              <h3 className="text-xl font-semibold">{theme.name}</h3>
              <p>Anime: {theme.anime?.name}</p>
              <p>Song: {theme.song?.title}</p>
              <p>Type: {theme.type}</p>
              {/* Add more theme details as needed */}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchResults;
