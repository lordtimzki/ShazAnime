import { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { identifySong } from "../services/api";
import { SongInfo } from "../types";

const MAX_LISTEN_MS = 18000; // Stop listening after 18 seconds
const CHUNK_INTERVAL_MS = 3000; // Send audio for recognition every 3 seconds

interface RecordButtonProps {
  onClick?: () => void;
  onIdentified?: (songInfo: SongInfo) => void;
  compact?: boolean;
}

export default function RecordButton({
  onClick,
  onIdentified,
  compact = false,
}: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const identifiedRef = useRef(false);
  const attemptRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const handleMatch = useCallback(
    (songInfo: SongInfo) => {
      if (onIdentified) {
        onIdentified(songInfo);
      } else {
        navigate("/results", { state: { songInfo } });
      }
    },
    [onIdentified, navigate]
  );

  const handleNoMatch = useCallback(() => {
    navigate("/results", {
      state: { songInfo: null, error: "No song identified" },
    });
  }, [navigate]);

  const releaseStream = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    releaseStream();
    setIsRecording(false);
  }, [releaseStream]);

  const tryIdentify = useCallback(
    async (chunks: Blob[], attempt: number) => {
      if (identifiedRef.current) return;

      const audioBlob = new Blob(chunks, { type: "audio/webm" });
      try {
        const songInfo: SongInfo = await identifySong(audioBlob);
        // Ignore stale responses
        if (identifiedRef.current || attempt !== attemptRef.current) return;

        if (songInfo && songInfo.title) {
          identifiedRef.current = true; // Set before stopRecording so onstop skips its final attempt
          stopRecording();
          handleMatch(songInfo);
        }
      } catch {
        // No match on this attempt — keep listening
      }
    },
    [stopRecording, handleMatch]
  );

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      identifiedRef.current = false;
      attemptRef.current = 0;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }

        // Don't send if already identified
        if (identifiedRef.current) return;

        // Send accumulated audio for identification
        attemptRef.current += 1;
        const currentAttempt = attemptRef.current;
        const chunksSoFar = [...audioChunksRef.current];
        tryIdentify(chunksSoFar, currentAttempt);
      };

      mediaRecorder.onstop = () => {
        // If we timed out without a match, do one final attempt with all audio
        if (!identifiedRef.current) {
          setIsProcessing(true);
          const allChunks = [...audioChunksRef.current];
          const audioBlob = new Blob(allChunks, { type: "audio/webm" });
          identifySong(audioBlob)
            .then((songInfo) => {
              if (identifiedRef.current) return;
              if (songInfo && songInfo.title) {
                identifiedRef.current = true;
                handleMatch(songInfo);
              } else {
                handleNoMatch();
              }
            })
            .catch(() => {
              if (!identifiedRef.current) handleNoMatch();
            })
            .finally(() => setIsProcessing(false));
        }
      };

      // Emit chunks at interval for progressive identification
      mediaRecorder.start(CHUNK_INTERVAL_MS);
      setIsRecording(true);

      // Auto-stop after max listen time
      timeoutRef.current = setTimeout(() => {
        if (!identifiedRef.current) {
          stopRecording();
        }
      }, MAX_LISTEN_MS);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    if (onClick) {
      onClick();
    }
  };

  // Compact version for re-scan on results page
  if (compact) {
    return (
      <button
        onClick={handleRecord}
        disabled={isProcessing}
        className="w-full flex items-center justify-center gap-3 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-[0_0_20px_rgba(0,136,255,0.3)] transition-all transform hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(0,136,255,0.5)] group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="p-1.5 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
          <span className="material-symbols-outlined text-2xl">
            {isProcessing ? "hourglass_top" : isRecording ? "stop" : "mic"}
          </span>
        </div>
        <span className="text-lg font-bold tracking-wide">
          {isProcessing
            ? "Identifying..."
            : isRecording
            ? "Stop Recording"
            : "Identify Another Song"}
        </span>
      </button>
    );
  }

  // Full-size version for home page
  return (
    <div className="relative group my-8">
      {/* Outer ping ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 md:w-80 md:h-80 rounded-full border border-primary/20 opacity-50 animate-ping-slow"></div>
      {/* Inner pulse circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 rounded-full bg-primary/5 animate-pulse"></div>

      {/* Main button */}
      <button
        onClick={handleRecord}
        disabled={isProcessing}
        aria-label={isRecording ? "Stop listening" : "Start listening"}
        className={`shazam-glow relative flex items-center justify-center w-36 h-36 md:w-48 md:h-48 rounded-full text-white z-20 group-active:scale-95 transition-transform duration-200 disabled:opacity-50 ${
          isRecording
            ? "bg-gradient-to-b from-red-400 to-red-600"
            : "bg-gradient-to-b from-[#40c4ff] to-[#0066cc]"
        }`}
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <span className="material-symbols-outlined !text-[4.5rem] md:!text-[5.5rem] drop-shadow-md">
          {isProcessing ? "hourglass_top" : isRecording ? "stop" : "mic"}
        </span>
      </button>

      {/* Bottom label */}
      <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-full whitespace-nowrap">
        <div className="flex flex-col items-center gap-3">
          <span className="text-white font-bold text-xl tracking-wide drop-shadow-sm group-hover:text-accent-blue transition-colors">
            {isProcessing
              ? "Identifying..."
              : isRecording
              ? "Tap to Stop"
              : "Click to Identify"}
          </span>
          {(isRecording || isProcessing) && (
            <div className="flex items-center gap-2 text-sm text-accent-blue font-medium bg-surface-dark/50 px-4 py-1.5 rounded-full border border-primary/20 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-blue"></span>
              </span>
              {isProcessing
                ? "Analyzing audio..."
                : "Listening for the melody..."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
