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

  // Track which navigation we've already handled to avoid double-processing
  const [handledKey, setHandledKey] = useState(location.key);

  useEffect(() => {
    // Only update songInfo for genuinely new navigations (different location.key)
    if (location.key !== handledKey && location.state?.songInfo) {
      setSongInfo(location.state.songInfo);
      setHandledKey(location.key);
    }
  }, [location.key, location.state, handledKey]);

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
