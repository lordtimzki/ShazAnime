import React, { useEffect, useState, useRef } from "react";
import { findAnimeTheme } from "../services/api";
import { SongInfo, AnimeThemeDetails } from "../types";
import RecordButton from "../components/RecordButton";

interface AnimeThemeResultsProps {
  songInfo: SongInfo;
  onNewSong: (songInfo: SongInfo) => void;
}

const AnimeThemeResults: React.FC<AnimeThemeResultsProps> = ({
  songInfo,
  onNewSong,
}) => {
  const [themeDetails, setThemeDetails] = useState<AnimeThemeDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const fetchThemeDetails = async () => {
      try {
        setLoading(true);
        const details = await findAnimeTheme(songInfo.artist, songInfo.title);
        if (details) {
          setThemeDetails(details);
          setError(null);
        } else {
          setError("No matching anime theme found.");
          setThemeDetails(null);
        }
      } catch (err) {
        setError("Failed to fetch anime theme details");
        setThemeDetails(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchThemeDetails();
  }, [songInfo]);

  const handleRecordClick = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onNewSong(songInfo);
  };

  if (loading) return <div>Loading anime theme details...</div>;
  if (error)
    return (
      <div className="flex flex-col items-center justify-center">
        <div>Error: {error}</div>
        <RecordButton onClick={handleRecordClick} /> {}
      </div>
    );
  if (!themeDetails)
    return (
      <div>
        No matching anime theme found.
        <RecordButton onClick={handleRecordClick} /> {}
      </div>
    );
  return (
    <div className="flex flex-col items-center justify-center p-4">
      {themeDetails.videoLink ? (
        <div className="w-full max-w-3xl mb-4 relative">
          <video
            ref={videoRef}
            src={themeDetails.videoLink}
            controls
            autoPlay
            className="w-full h-auto max-h-[432px] rounded-lg shadow-lg transition duration-300"
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
          "{themeDetails.songName}" by {themeDetails.artistNames.join(", ")}
        </p>
        <span className="text-lg">{themeDetails.year}</span>
      </div>
      <RecordButton onClick={handleRecordClick} /> {}
    </div>
  );
};

export default AnimeThemeResults;
