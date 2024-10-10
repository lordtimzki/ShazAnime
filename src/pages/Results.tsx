import { useLocation } from "react-router-dom";
import AnimeThemeResults from "../components/AnimeThemesResults";
import { SongInfo } from "../types";
import { useEffect } from "react";

export default function Results() {
  const location = useLocation();
  const songInfo = location.state?.songInfo as SongInfo;

  useEffect(() => {
    if (songInfo) {
      console.log("Identified Song:", songInfo);
      console.log("Raw Song Info:", JSON.stringify(songInfo, null, 2));
    }
  }, [songInfo]);

  if (!songInfo) {
    return <div className="p-8 text-customColor">No song data available</div>;
  }

  return (
    <div className="p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-8">Results</h1>
      <AnimeThemeResults songInfo={songInfo} onNewSong={() => {}} />
    </div>
  );
}
