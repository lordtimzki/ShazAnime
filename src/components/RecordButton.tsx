import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { identifySong } from "../services/api";
import { SongInfo } from "../types";

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
  const navigate = useNavigate();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = handleRecordingStop;

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleRecordingStop = async () => {
    setIsProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    try {
      const songInfo: SongInfo = await identifySong(audioBlob);
      if (songInfo && songInfo.title) {
        if (onIdentified) {
          onIdentified(songInfo);
        } else {
          navigate("/results", { state: { songInfo } });
        }
      } else {
        navigate("/results", {
          state: { songInfo: null, error: "No song identified" },
        });
      }
    } catch (error) {
      console.error("Error identifying song:", error);
      navigate("/results", {
        state: { songInfo: null, error: "Error identifying song" },
      });
    } finally {
      setIsProcessing(false);
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
