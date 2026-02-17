import { useLocation, useNavigate } from "react-router-dom";
import AnimeThemeResults from "../components/AnimeThemesResults";
import { SongInfo } from "../types";
import { useEffect, useState } from "react";

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();
  const [songInfo, setSongInfo] = useState<SongInfo | null>(
    location.state?.songInfo || null
  );

  useEffect(() => {
    if (songInfo) {
      console.log("Identified Song:", songInfo);
      console.log("Raw Song Info:", JSON.stringify(songInfo, null, 2));
    }
  }, [songInfo]);

  // No song data — show error via AnimeThemesResults with a dummy SongInfo
  if (!songInfo) {
    return (
      <AnimeThemeResults
        songInfo={{ title: "", originalTitle: "", artist: "" }}
        onNewSong={(newSongInfo) => setSongInfo(newSongInfo)}
      />
    );
  }

  return (
    <AnimeThemeResults
      songInfo={songInfo}
      onNewSong={(newSongInfo) => setSongInfo(newSongInfo)}
    />
  );
}
