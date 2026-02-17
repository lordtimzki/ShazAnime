import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-72px)] bg-anime-pattern">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={() => navigate("/")}
            className="text-text-dim hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">
              arrow_back
            </span>
          </button>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            About
          </h1>
        </div>

        <div className="space-y-8 animate-fade-in-up">
          {/* App description */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="size-12 rounded-full bg-gradient-to-tr from-primary to-accent-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,136,255,0.5)]">
                <span className="material-symbols-outlined text-2xl text-white">
                  graphic_eq
                </span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">ShazAnime</h2>
                <p className="text-text-dim text-sm">
                  Anime Theme Identifier
                </p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              {/* TODO: Add your own description here */}
              ShazAnime identifies anime openings and endings by listening to
              audio. Simply tap the mic, play a song, and discover which anime
              it belongs to — complete with the theme video, song details, and
              streaming links.
            </p>
          </div>

          {/* How it works */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">How it works</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-white font-medium">Listen</p>
                  <p className="text-text-dim text-sm">
                    Tap the mic and play an anime opening or ending
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-white font-medium">Identify</p>
                  <p className="text-text-dim text-sm">
                    ShazamIO recognizes the song, then we match it against AnimeThemes
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-primary font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-white font-medium">Watch</p>
                  <p className="text-text-dim text-sm">
                    See the theme video, anime info, and listen on Apple Music
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Credits */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Credits</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-dim">Song Recognition</span>
                <a
                  href="https://github.com/shazamio/ShazamIO"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  ShazamIO
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Anime Theme Database</span>
                <a
                  href="https://animethemes.moe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  AnimeThemes
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-text-dim">Built by</span>
                <span className="text-white font-medium">lordtimzki</span>
              </div>
            </div>
          </div>

          {/* Contact / Links placeholder */}
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-3">Links</h3>
            <div className="space-y-2">
              <a
                href="https://github.com/lordtimzki/ShazAnime"
                className="flex items-center gap-2 text-primary hover:underline text-sm"
                target="_blank"
              >
                <span className="material-symbols-outlined text-base">code</span>
                GitHub Repository
              </a>
              <a
                href="http://timdac.dev/"
                className="flex items-center gap-2 text-primary hover:underline text-sm"
                target="_blank"
              >
                <span className="material-symbols-outlined text-base">language</span>
                Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
