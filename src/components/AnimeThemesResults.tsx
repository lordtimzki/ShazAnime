import React, { useEffect, useState } from "react";
import { searchAnimeTheme } from "../services/api";

interface AnimeThemeResultsProps {
  songInfo: {
    title: string;
    artist: string;
  };
}

interface AnimeTheme {
  id: number;
  name: string;
  anime: {
    name: string;
  };
  song: {
    title: string;
    artists: Array<{ name: string }>;
  };
  type: string;
  video?: {
    link: string;
  };
}

const AnimeThemeResults: React.FC<AnimeThemeResultsProps> = ({ songInfo }) => {
  const [themes, setThemes] = useState<AnimeTheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const data = await searchAnimeTheme(songInfo);
        setThemes(data.anime_themes || []);
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
  if (themes.length === 0) return <div>No matching anime themes found.</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mt-8 mb-4">Matching Anime Themes</h2>
      <ul className="space-y-4">
        {themes.map((theme) => (
          <li key={theme.id} className="border p-4 rounded-lg">
            <h3 className="text-xl font-semibold">{theme.name}</h3>
            <p>Anime: {theme.anime.name}</p>
            <p>Song: {theme.song.title}</p>
            <p>
              Artists:{" "}
              {theme.song.artists.map((artist) => artist.name).join(", ")}
            </p>
            <p>Type: {theme.type}</p>
            {theme.video && theme.video.link && (
              <a
                href={theme.video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Watch Theme
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AnimeThemeResults;
