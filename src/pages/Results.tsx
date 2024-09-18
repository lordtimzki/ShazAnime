import React from "react";
import { useLocation } from "react-router-dom";
import AnimeThemeResults from "../components/AnimeThemesResults";

export default function Results() {
  const location = useLocation();
  const songData = location.state?.songData;

  if (!songData) {
    return <div className="p-8">No song data available</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Results</h1>
      {songData.status === "success" ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Identified Song</h2>
          <p>Title: {songData.result.title}</p>
          <p>Artist: {songData.result.artist}</p>
          <p>Album: {songData.result.album}</p>
          <p>Release Date: {songData.result.release_date}</p>

          <AnimeThemeResults
            songInfo={{
              title: songData.result.title,
              artist: songData.result.artist,
            }}
          />
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4">Song Not Identified</h2>
          <p>Status: {songData.status}</p>
          <p>Error: {songData.error?.error_message}</p>
        </div>
      )}
      <h2 className="text-2xl font-bold mt-8 mb-4">Raw API Response</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
        {JSON.stringify(songData, null, 2)}
      </pre>
    </div>
  );
}
