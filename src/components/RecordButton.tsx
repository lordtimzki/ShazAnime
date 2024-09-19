import React, { useState, useRef } from "react";
import { FaMicrophone, FaStop } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { identifySong } from "../services/api";
import { SongInfo } from "../types";

export default function RecordButton() {
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
      alert(
        "Error accessing microphone. Please check your microphone settings."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleRecordingStop = async () => {
    setIsProcessing(true);
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    try {
      const songInfo: SongInfo = await identifySong(audioBlob);
      console.log("Identified song:", songInfo);
      if (songInfo && songInfo.title) {
        navigate("/results", { state: { songInfo } });
      } else {
        console.log("No song identified");
        alert("No song identified. Please try again.");
      }
    } catch (error) {
      console.error("Error identifying song:", error);
      alert("Error identifying song. Please try again.");
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
  };

  return (
    <button
      onClick={handleRecord}
      disabled={isProcessing}
      className={`p-4 rounded-full ${
        isRecording ? "bg-red-500" : "bg-blue-500"
      } text-white ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isProcessing ? (
        "Processing..."
      ) : isRecording ? (
        <FaStop size={24} />
      ) : (
        <FaMicrophone size={24} />
      )}
    </button>
  );
}
