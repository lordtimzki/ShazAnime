import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { AnimeThemeDetails, SongInfo } from "../types";

interface VideoState {
  videoUrl: string;
  themeDetails: AnimeThemeDetails | null;
  songInfo: SongInfo | null;
}

interface VideoContextType {
  videoState: VideoState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  setActiveVideo: (
    url: string,
    details: AnimeThemeDetails,
    songInfo: SongInfo
  ) => void;
  clearVideo: () => void;
  isPiPVisible: boolean;
  setIsPiPVisible: (visible: boolean) => void;
  /** Mount the shared video element into a target container */
  mountVideoTo: (container: HTMLElement) => void;
}

const VideoContext = createContext<VideoContextType | null>(null);

const initialState: VideoState = {
  videoUrl: "",
  themeDetails: null,
  songInfo: null,
};

export function VideoProvider({ children }: { children: React.ReactNode }) {
  const [videoState, setVideoState] = useState<VideoState>(initialState);
  const [isPiPVisible, setIsPiPVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoHolderRef = useRef<HTMLDivElement>(null);

  // Create the shared video element once
  useEffect(() => {
    if (!videoRef.current) {
      const video = document.createElement("video");
      video.className = "w-full h-full object-contain";
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      videoRef.current = video;
    }
  }, []);

  const setActiveVideo = useCallback(
    (url: string, details: AnimeThemeDetails, songInfo: SongInfo) => {
      const video = videoRef.current;
      if (video && video.src !== url) {
        video.src = url;
        video.load();
        video.play().catch(() => {});
      }
      setVideoState({ videoUrl: url, themeDetails: details, songInfo });
    },
    []
  );

  const mountVideoTo = useCallback((container: HTMLElement) => {
    const video = videoRef.current;
    if (video && video.parentElement !== container) {
      container.appendChild(video);
    }
  }, []);

  const clearVideo = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeAttribute("src");
      video.load();
      // Move back to hidden holder
      if (videoHolderRef.current) {
        videoHolderRef.current.appendChild(video);
      }
    }
    setVideoState(initialState);
    setIsPiPVisible(false);
  }, []);

  return (
    <VideoContext.Provider
      value={{
        videoState,
        videoRef,
        setActiveVideo,
        clearVideo,
        isPiPVisible,
        setIsPiPVisible,
        mountVideoTo,
      }}
    >
      {children}
      {/* Hidden holder for the video element when not mounted elsewhere */}
      <div ref={videoHolderRef} style={{ display: "none" }} />
    </VideoContext.Provider>
  );
}

export function useVideo() {
  const ctx = useContext(VideoContext);
  if (!ctx) throw new Error("useVideo must be used within a VideoProvider");
  return ctx;
}
