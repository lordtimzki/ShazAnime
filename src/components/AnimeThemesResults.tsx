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
  const [spotifyUrl, setSpotifyUrl] = useState<string | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { videoState, videoRef, setActiveVideo, setIsPiPVisible, mountVideoTo } =
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

  // Mount the shared video element into our container
  useEffect(() => {
    if (themeDetails?.videoLink && videoContainerRef.current) {
      const video = videoRef.current;
      if (video) {
        video.controls = true;
        video.className = "w-full h-full object-contain";
      }
      mountVideoTo(videoContainerRef.current);
    }
  }, [themeDetails, mountVideoTo, videoRef]);

  // Fetch Spotify link via Odesli/song.link
  useEffect(() => {
    const lookupUrl = songInfo.appleMusicUrl || songInfo.shazamUrl;
    if (!lookupUrl) return;
    setSpotifyUrl(null);
    const fetchSpotify = async () => {
      try {
        const res = await fetch(
          `https://api.song.link/v1-alpha.1/links?url=${encodeURIComponent(lookupUrl)}`
        );
        if (!res.ok) return;
        const data = await res.json();
        const spotify = data.linksByPlatform?.spotify?.url;
        if (spotify) setSpotifyUrl(spotify);
      } catch {
        // Silently fail — Spotify link is optional
      }
    };
    fetchSpotify();
  }, [songInfo.appleMusicUrl, songInfo.shazamUrl]);

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
              <div ref={videoContainerRef} className="w-full h-full" />
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

            {/* Streaming links row */}
            {(songInfo.appleMusicUrl || spotifyUrl) && (
              <div className="flex gap-3">
                {/* Apple Music button */}
                {songInfo.appleMusicUrl && (
                  <a
                    href={songInfo.appleMusicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#FA243C]/10 hover:bg-[#FA243C]/20 text-[#FA243C] rounded-lg transition-colors border border-[#FA243C]/20"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="m10.995 0 .573.001q.241 0 .483.007c.35.01.705.03 1.051.093.352.063.68.166.999.329a3.36 3.36 0 0 1 1.47 1.468c.162.32.265.648.328 1 .063.347.084.7.093 1.051q.007.241.007.483l.001.573v5.99l-.001.573q0 .241-.008.483c-.01.35-.03.704-.092 1.05a3.5 3.5 0 0 1-.33 1 3.36 3.36 0 0 1-1.468 1.468 3.5 3.5 0 0 1-1 .33 7 7 0 0 1-1.05.092q-.241.007-.483.008l-.573.001h-5.99l-.573-.001q-.241 0-.483-.008a7 7 0 0 1-1.052-.092 3.6 3.6 0 0 1-.998-.33 3.36 3.36 0 0 1-1.47-1.468 3.6 3.6 0 0 1-.328-1 7 7 0 0 1-.093-1.05Q.002 11.81 0 11.568V5.005l.001-.573q0-.241.007-.483c.01-.35.03-.704.093-1.05a3.6 3.6 0 0 1 .329-1A3.36 3.36 0 0 1 1.9.431 3.5 3.5 0 0 1 2.896.1 7 7 0 0 1 3.95.008Q4.19.002 4.432 0h.573zm-.107 2.518-4.756.959H6.13a.66.66 0 0 0-.296.133.5.5 0 0 0-.16.31c-.004.027-.01.08-.01.16v5.952c0 .14-.012.275-.106.39-.095.115-.21.15-.347.177l-.31.063c-.393.08-.65.133-.881.223a1.4 1.4 0 0 0-.519.333 1.25 1.25 0 0 0-.332.995c.031.297.166.582.395.792.156.142.35.25.578.296.236.047.49.031.858-.043.196-.04.38-.102.555-.205a1.4 1.4 0 0 0 .438-.405 1.5 1.5 0 0 0 .233-.55c.042-.202.052-.386.052-.588V6.347c0-.276.08-.35.302-.404.024-.005 3.954-.797 4.138-.833.257-.049.378.025.378.294v3.524c0 .14-.001.28-.096.396-.094.115-.211.15-.348.178l-.31.062c-.393.08-.649.133-.88.223a1.4 1.4 0 0 0-.52.334 1.26 1.26 0 0 0-.34.994c.03.297.174.582.404.792a1.2 1.2 0 0 0 .577.294c.237.048.49.03.858-.044.197-.04.381-.098.556-.202a1.4 1.4 0 0 0 .438-.405q.173-.252.233-.549a2.7 2.7 0 0 0 .044-.589V2.865c0-.273-.143-.443-.4-.42-.04.003-.383.064-.424.073" />
                    </svg>
                    <span className="text-sm font-bold">Apple Music</span>
                  </a>
                )}

                {/* Spotify button */}
                {spotifyUrl && (
                  <a
                    href={spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#1DB954]/10 hover:bg-[#1DB954]/20 text-[#1DB954] rounded-lg transition-colors border border-[#1DB954]/20"
                  >
                    <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    <span className="text-sm font-bold">Spotify</span>
                  </a>
                )}
              </div>
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
      </aside>
      </div>
    </div>
  );
};

export default AnimeThemeResults;
