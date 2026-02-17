import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHistory } from "../services/history";

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(getHistory());

  const handleClear = () => {
    localStorage.removeItem("shazanime_history");
    setHistory([]);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-anime-pattern">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="text-text-dim hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">
                arrow_back
              </span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                History
              </h1>
              <p className="text-text-dim text-xs mt-0.5">
                Recently identified themes
              </p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-text-dim hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                delete
              </span>
              Clear
            </button>
          )}
        </div>

        {/* Empty state */}
        {history.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-in-up">
            <div className="size-20 bg-surface-dark border border-surface-border rounded-full flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[36px] text-primary/50">
                history
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mb-1">
              No history yet
            </h2>
            <p className="text-text-dim text-sm mb-5 text-center max-w-xs">
              Identified songs will appear here.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-sm transition-colors"
            >
              Identify a Song
            </button>
          </div>
        )}

        {/* History list */}
        {history.length > 0 && (
          <div className="space-y-2 animate-fade-in-up">
            {history.map((entry) => {
              const label = `${entry.themeType}${entry.sequence ? entry.sequence : ""}`;
              const timeAgo = getRelativeTime(entry.timestamp);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-surface-dark/60 hover:bg-surface-dark border border-white/5 transition-colors"
                >
                  {/* Anime art */}
                  {entry.animeImage ? (
                    <img
                      src={entry.animeImage}
                      alt={entry.animeName}
                      className="size-11 rounded-lg object-cover shrink-0 border border-white/10"
                    />
                  ) : (
                    <div className="size-11 rounded-lg bg-surface-darker border border-white/10 shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-lg text-gray-600">
                        movie
                      </span>
                    </div>
                  )}

                  {/* Song info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {entry.songName}
                    </p>
                    <p className="text-text-dim text-xs truncate">
                      {entry.animeName}
                    </p>
                  </div>

                  {/* Badge + time */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      {label}
                    </span>
                    <span className="text-[10px] text-text-dim">{timeAgo}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function getRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
