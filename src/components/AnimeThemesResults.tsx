import { useEffect, useState, useRef } from "react";
import { findAnimeTheme } from "../services/api";
import { SongInfo, AnimeThemeDetails } from "../types";
import { addToHistory } from "../services/history";
import RecordButton from "./RecordButton";
import { useNavigate } from "react-router-dom";
import { useVideo } from "../contexts/VideoContext";

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
  const navigate = useNavigate();
  const { videoState, setActiveVideo, savePlaybackTime, setIsPiPVisible } =
    useVideo();

  useEffect(() => {
    // If returning from PiP with the same song, restore without re-fetching
    if (
      videoState.themeDetails &&
      videoState.songInfo &&
      videoState.songInfo.title === songInfo.title
    ) {
      setThemeDetails(videoState.themeDetails);
      setLoading(false);
      setIsPiPVisible(false);
      return;
    }

    const fetchThemeDetails = async () => {
      try {
        setLoading(true);
        const details = await findAnimeTheme(songInfo.artist, songInfo.title);
        if (details) {
          setThemeDetails(details);
          setError(null);
          addToHistory(details, songInfo.coverArt || "");
          setActiveVideo(details.videoLink, details, songInfo);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songInfo]);

  // Restore playback position when returning from PiP
  useEffect(() => {
    if (videoRef.current && videoState.currentTime > 0 && themeDetails) {
      videoRef.current.currentTime = videoState.currentTime;
      videoRef.current.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeDetails]);

  // Save playback time periodically for PiP handoff
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleTimeUpdate = () => savePlaybackTime(video.currentTime);
    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [themeDetails, savePlaybackTime]);

  // Loading state
  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center p-8 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]"></div>
        </div>
        <div className="flex flex-col items-center gap-6 z-10 animate-fade-in-up">
          <div className="relative size-24 flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping-slow"></div>
            <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">
              graphic_eq
            </span>
          </div>
          <div className="text-center">
            <h2 className="text-white text-2xl font-bold mb-2">
              Searching anime database...
            </h2>
            <p className="text-text-dim">
              Looking for "{songInfo.title}" by {songInfo.artist}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // No match / error state
  if (error || !themeDetails) {
    return (
      <div className="flex-grow flex items-center justify-center p-4 md:p-8 relative">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px]"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px]"></div>
        </div>

        <div className="flex flex-col items-center justify-center max-w-[640px] w-full z-10 animate-fade-in-up">
          {/* Icon */}
          <div className="relative mb-10 group cursor-default">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-110"></div>
            <div className="relative size-40 md:size-48 bg-surface-dark border border-surface-border rounded-full flex items-center justify-center shadow-2xl shadow-primary/10">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-full pointer-events-none"></div>
              <div className="relative flex flex-col items-center justify-center opacity-90">
                <span className="material-symbols-outlined text-[80px] md:text-[96px] text-primary/80 drop-shadow-[0_0_15px_rgba(0,136,255,0.4)]">
                  music_off
                </span>
                <div
                  className="absolute top-2 right-6 w-3 h-3 bg-sky-300 rounded-full animate-bounce"
                  style={{ animationDuration: "2s" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="flex flex-col items-center gap-4 text-center mb-10">
            <h1 className="text-white text-3xl md:text-4xl font-bold leading-tight tracking-tight">
              Gomen Ne! We couldn't find a match
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-normal leading-relaxed max-w-[480px]">
              {songInfo.title
                ? `We found "${songInfo.title}" by ${songInfo.artist}, but couldn't match it to an anime theme in the AnimeThemes database.`
                : "The audio clip might be too short, distorted, or this song isn't in the AnimeThemes database yet."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col items-center w-full gap-6">
            {/* Try Again button */}
            <button
              onClick={() => navigate("/")}
              className="group relative w-full max-w-[320px] overflow-hidden rounded-xl bg-gradient-to-r from-primary to-[#4FACFE] p-[1px] shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <div className="relative flex h-12 items-center justify-center gap-2 rounded-xl bg-primary hover:bg-opacity-0 transition-all duration-300">
                <span
                  className="material-symbols-outlined text-white group-hover:animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "1s",
                  }}
                >
                  replay
                </span>
                <span className="text-white text-base font-bold tracking-wide">
                  Try Again
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Match result
  const themeLabel = `${themeDetails.themeType}${themeDetails.sequence ? themeDetails.sequence : ""}`;

  return (
    <div className="flex-1 flex flex-col max-w-[1440px] mx-auto w-full p-6 gap-4 animate-fade-in-up">
      {/* Breadcrumb — above both columns */}
      <div className="flex items-center gap-2 text-sm">
        <a
          className="text-primary hover:underline cursor-pointer"
          onClick={() => navigate("/")}
        >
          Scan
        </a>
        <span className="text-gray-500">/</span>
        <span className="text-gray-400">Results</span>
      </div>

      {/* Two-column layout — video + sidebar aligned */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column — Video player */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Video */}
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl shadow-primary/20 group border border-primary/50">
            {themeDetails.videoLink ? (
              <video
                ref={videoRef}
                src={themeDetails.videoLink}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-6xl text-gray-600 mb-4">
                    videocam_off
                  </span>
                  <p className="text-gray-500">No video available</p>
                </div>
              </div>
            )}
          </div>

          {/* Re-scan button */}
          <RecordButton
            compact
            onIdentified={(newSongInfo) => {
              if (videoRef.current) videoRef.current.pause();
              onNewSong(newSongInfo);
            }}
            onClick={() => {
              if (videoRef.current) videoRef.current.pause();
            }}
          />
        </div>

      {/* Right column — Details sidebar */}
      <aside className="w-full lg:w-[380px] flex flex-col gap-6 shrink-0">
        {/* Song info card */}
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col gap-6 relative overflow-hidden">
          {/* Glow accent */}
          <div className="absolute -top-20 -right-20 size-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none"></div>

          {/* Song header */}
          <div className="relative z-10 flex gap-5 items-start">
            {/* Album art */}
            {songInfo.coverArt ? (
              <img
                className="size-24 rounded-lg shadow-lg object-cover bg-surface-darker border border-white/10 shrink-0"
                src={songInfo.coverArt}
                alt={`${songInfo.title} album art`}
              />
            ) : (
              <div className="size-24 rounded-lg shadow-lg bg-surface-darker border border-white/10 shrink-0 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-gray-600">
                  album
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1">
              {/* Theme type badge */}
              <span className="inline-flex items-center justify-center w-fit px-2 py-0.5 rounded text-[10px] font-bold bg-primary text-white mb-1">
                {themeLabel}
              </span>
              <h1 className="text-2xl font-bold text-primary leading-tight animate-slide-right [animation-delay:400ms]">
                {themeDetails.songName}
              </h1>
              <p className="text-accent-blue font-medium animate-slide-right [animation-delay:600ms]">
                {themeDetails.artistNames.join(", ")}
              </p>
            </div>
          </div>

          {/* Anime info */}
          <div className="relative z-10 space-y-4">
            <div className="p-4 bg-surface-darker rounded-xl border border-white/5">
              <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">
                From the Series
              </p>
              <h3 className="text-lg font-bold text-white">
                {themeDetails.animeName}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Released {themeDetails.year}
              </p>
            </div>

            {/* Apple Music button */}
            {songInfo.appleMusicUrl && (
              <a
                href={songInfo.appleMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-[#FA243C]/10 hover:bg-[#FA243C]/20 text-[#FA243C] rounded-lg transition-colors border border-[#FA243C]/20 w-full"
              >
                <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.893 3.636h.634c-1.332 0-2.55.223-3.606.608-1.11.405-2.028.941-2.921 1.701-.893-.76-1.811-1.296-2.921-1.701-1.056-.385-2.274-.608-3.606-.608h-.634C2.19 3.636 0 5.826 0 8.476v11.77c0 .066.054.118.12.118h5.688c.066 0 .12-.052.12-.118V8.95c1.474-.356 2.651.192 3.426.79.053.041.127.041.18 0 .47-.361.968-.68 1.488-.952.484-.253.987-.457 1.503-.608.281-.082.566-.142.853-.178V20.246c0 .066.054.118.12.118h5.688c.066 0 .12-.052.12-.118V8.476c0-2.65-2.19-4.84-4.839-4.84zm-9.352 14.832c-1.352-1.039-3.235-1.01-4.707-.468v-8.58c1.688-.475 3.518-.328 4.707.575v8.473zm10.745-.468c-1.472-.542-3.355-.571-4.707.468V9.595c1.19-1.012 3.197-1.037 4.707-.575v8.582z" />
                </svg>
                <span className="text-sm font-bold">Open in Apple Music</span>
              </a>
            )}

            {/* Shazam link */}
            {songInfo.shazamUrl && (
              <a
                href={songInfo.shazamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 p-3 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors border border-primary/20 w-full"
              >
                <span className="material-symbols-outlined text-lg">open_in_new</span>
                <span className="text-sm font-bold">View on Shazam</span>
              </a>
            )}
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
};

export default AnimeThemeResults;
