import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useVideo } from "../contexts/VideoContext";

export default function PiPPlayer() {
  const { videoState, savePlaybackTime, clearVideo, isPiPVisible } =
    useVideo();
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // Only show PiP when not on /results and there's an active video
  const shouldShow =
    isPiPVisible && location.pathname !== "/results" && videoState.videoUrl;

  // Restore playback time when PiP appears
  useEffect(() => {
    if (shouldShow && videoRef.current) {
      videoRef.current.currentTime = videoState.currentTime;
      videoRef.current.play().catch(() => {});
    }
  }, [shouldShow]);

  // Save playback time periodically
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldShow) return;

    const handleTimeUpdate = () => {
      savePlaybackTime(video.currentTime);
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [shouldShow, savePlaybackTime]);

  if (!shouldShow) return null;

  const handleClick = () => {
    // Save current time before navigating
    if (videoRef.current) {
      savePlaybackTime(videoRef.current.currentTime);
    }
    navigate("/results", {
      state: { songInfo: videoState.songInfo },
    });
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearVideo();
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };

  const details = videoState.themeDetails;
  const label = details
    ? `${details.themeType}${details.sequence || ""}`
    : "";

  return (
    <div
      className={`fixed z-[100] transition-all duration-300 ease-in-out ${
        isMinimized
          ? "bottom-4 right-4 w-14 h-14"
          : "bottom-4 right-4 w-[320px] md:w-[360px]"
      }`}
    >
      {isMinimized ? (
        /* Minimized: just a round play button */
        <button
          onClick={handleMinimize}
          className="w-14 h-14 rounded-full bg-primary shadow-[0_0_20px_rgba(0,136,255,0.4)] flex items-center justify-center hover:scale-105 transition-transform animate-pip-enter"
        >
          <span className="material-symbols-outlined text-white text-2xl">
            play_arrow
          </span>
        </button>
      ) : (
        /* Expanded PiP */
        <div className="rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.6)] border border-white/10 bg-surface-dark animate-pip-enter">
          {/* Video */}
          <div className="relative cursor-pointer group" onClick={handleClick}>
            <video
              ref={videoRef}
              src={videoState.videoUrl}
              className="w-full aspect-video bg-black"
              muted={false}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-4xl">
                open_in_full
              </span>
            </div>
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-3 px-3 py-2.5">
            {details?.animeImage && (
              <img
                src={details.animeImage}
                alt={details.animeName}
                className="w-9 h-9 rounded-lg object-cover shrink-0 border border-white/10"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {details?.songName}
              </p>
              <p className="text-text-dim text-[10px] truncate">
                {details?.animeName}
                {label && (
                  <span className="ml-1 text-primary font-bold">{label}</span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={handleMinimize}
                className="p-1 text-text-dim hover:text-white transition-colors"
                title="Minimize"
              >
                <span className="material-symbols-outlined text-lg">
                  minimize
                </span>
              </button>
              <button
                onClick={handleClose}
                className="p-1 text-text-dim hover:text-red-400 transition-colors"
                title="Close"
              >
                <span className="material-symbols-outlined text-lg">
                  close
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
