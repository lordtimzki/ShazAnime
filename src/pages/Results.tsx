import React from "react";
import { useLocation } from "react-router-dom";
import AnimeThemeResults from "../components/AnimeThemesResults";
import { SongInfo } from "../types";

export default function Results() {
  const location = useLocation();
  const songInfo = location.state?.songInfo as SongInfo;

  if (!songInfo) {
    return <div className="p-8">No song data available</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Results</h1>
      <div>
        <h2 className="text-2xl font-bold mb-4">Identified Song</h2>
        <p>Title: {songInfo.title}</p>
        {songInfo.title !== songInfo.originalTitle && (
          <p>Original Title: {songInfo.originalTitle}</p>
        )}
        <p>Artist: {songInfo.artist}</p>
        {songInfo.album && <p>Album: {songInfo.album}</p>}
        {songInfo.release_date && <p>Release Date: {songInfo.release_date}</p>}

        <AnimeThemeResults songInfo={songInfo} />
      </div>

      <h2 className="text-2xl font-bold mt-8 mb-4">Raw Song Info</h2>
      <pre className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
        {JSON.stringify(songInfo, null, 2)}
      </pre>
    </div>
  );
}
