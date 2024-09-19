import React, { useEffect, useState } from "react";
import { findAnimeTheme } from "../services/api";
import { SongInfo, AnimeThemeDetails } from "../types";

interface AnimeThemeResultsProps {
  songInfo: SongInfo;
}

const AnimeThemeResults: React.FC<AnimeThemeResultsProps> = ({ songInfo }) => {
  const [themeDetails, setThemeDetails] = useState<AnimeThemeDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        setLoading(true);
        const details = await findAnimeTheme(songInfo.artist, songInfo.title);
        if (details) {
          setThemeDetails(details);
        } else {
          setError("No matching anime theme found.");
        }
      } catch (err) {
        setError("Failed to fetch anime theme details");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemeDetails();
  }, [songInfo]);

  if (loading) return <div>Loading anime theme details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!themeDetails) return <div>No matching anime theme found.</div>;

  return (
    <div className="flex flex-col md:flex-row justify-between">
      <div className="md:w-1/2">
        <h2 className="text-2xl font-bold mt-8 mb-4">Anime Theme Details</h2>
        <p>Artist: {themeDetails.artistName}</p>
        <p>Song: {themeDetails.songName}</p>
        <p>Anime: {themeDetails.animeName}</p>
        <p>
          Type: {themeDetails.themeType}
          {themeDetails.sequence}
        </p>
        <p>Year: {themeDetails.year}</p>
      </div>
      <div className="md:w-1/2 mt-8 md:mt-0">
        {themeDetails.videoLink ? (
          <video
            src={themeDetails.videoLink}
            controls
            autoPlay
            loop
            className="w-full"
          >
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>No video available for this theme.</p>
        )}
      </div>
    </div>
  );
};

export default AnimeThemeResults;
