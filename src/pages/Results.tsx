import { useLocation } from "react-router-dom";
import AnimeThemeResults from "../components/AnimeThemesResults";
import { SongInfo } from "../types";
import { useEffect, useState } from "react";
import { useVideo } from "../contexts/VideoContext";

export default function Results() {
  const location = useLocation();
  const { videoState } = useVideo();

  // Priority: route state > video context (returning from PiP)
  const [songInfo, setSongInfo] = useState<SongInfo | null>(
    location.state?.songInfo || videoState.songInfo || null
  );

  useEffect(() => {
    // If navigating here with new song info from route state, use it
    if (location.state?.songInfo) {
      setSongInfo(location.state.songInfo);
    }
  }, [location.state]);

  useEffect(() => {
    if (songInfo) {
      console.log("Identified Song:", songInfo);
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
