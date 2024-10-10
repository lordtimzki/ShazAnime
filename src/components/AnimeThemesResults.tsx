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
    <div className="flex flex-col items-center justify-center p-4">
      {themeDetails.videoLink ? (
        <div className="w-full max-w-3xl mb-4 relative">
          <video
            src={themeDetails.videoLink}
            controls
            autoPlay
            className="w-full h-auto max-h-[768px] rounded-lg shadow-lg transition duration-300"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      ) : (
        <p>No video available for this theme.</p>
      )}
      <div className="w-full pl-5">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl">
            {themeDetails.animeName}
            <span className="font-bold">
              {" "}
              {themeDetails.themeType}
              {themeDetails.sequence}
            </span>
          </h2>
        </div>
        <p className="text-xl italic mb-2">
          "{themeDetails.songName}" by {themeDetails.artistName}
        </p>
        <span className="text-lg">{themeDetails.year}</span>
      </div>
    </div>
  );
};

export default AnimeThemeResults;
