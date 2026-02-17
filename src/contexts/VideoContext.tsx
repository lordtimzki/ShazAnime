import { createContext, useContext, useState, useRef, useCallback } from "react";
import { AnimeThemeDetails, SongInfo } from "../types";

interface VideoState {
  videoUrl: string;
  currentTime: number;
  isPlaying: boolean;
  themeDetails: AnimeThemeDetails | null;
  songInfo: SongInfo | null;
}

interface VideoContextType {
  videoState: VideoState;
  setActiveVideo: (
    url: string,
    details: AnimeThemeDetails,
    songInfo: SongInfo
  ) => void;
  savePlaybackTime: (time: number) => void;
  clearVideo: () => void;
  isPiPVisible: boolean;
  setIsPiPVisible: (visible: boolean) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

const initialState: VideoState = {
  videoUrl: "",
  currentTime: 0,
  isPlaying: false,
  themeDetails: null,
  songInfo: null,
};

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [videoState, setVideoState] = useState<VideoState>(initialState);
  const [isPiPVisible, setIsPiPVisible] = useState(false);

  const setActiveVideo = useCallback(
    (url: string, details: AnimeThemeDetails, songInfo: SongInfo) => {
      setVideoState({
        videoUrl: url,
        currentTime: 0,
        isPlaying: true,
        themeDetails: details,
        songInfo: songInfo,
      });
    },
    []
  );

  const savePlaybackTime = useCallback((time: number) => {
    setVideoState((prev) => ({ ...prev, currentTime: time }));
  }, []);

  const clearVideo = useCallback(() => {
    setVideoState(initialState);
    setIsPiPVisible(false);
  }, []);

  return (
    <VideoContext.Provider
      value={{
        videoState,
        setActiveVideo,
        savePlaybackTime,
        clearVideo,
        isPiPVisible,
        setIsPiPVisible,
      }}
    >
      {children}
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error("useVideo must be used within a VideoProvider");
  return ctx;
}
