import { useNavigate, useLocation } from "react-router-dom";
import { useVideo } from "../contexts/VideoContext";
import PiPPlayer from "./PiPPlayer";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { videoState, setIsPiPVisible } = useVideo();

  const handleNavigate = (path: string) => {
    // If leaving /results with an active video, activate PiP
    if (location.pathname === "/results" && videoState.videoUrl) {
      setIsPiPVisible(true);
    }
    navigate(path);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center px-6 py-4 md:px-10 border-b border-surface-border backdrop-blur-md bg-background-dark/80">
        {/* Left — Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => handleNavigate("/")}
        >
          <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-tr from-primary to-accent-blue text-white shadow-[0_0_15px_rgba(0,136,255,0.5)]">
            <span className="material-symbols-outlined text-2xl">
              graphic_eq
            </span>
          </div>
          <h2 className="text-white text-xl font-bold tracking-tight">
            ShazAnime
          </h2>
        </div>

        {/* Center — Nav */}
        <nav className="hidden md:flex items-center justify-center gap-8">
          <button
            onClick={() => handleNavigate("/history")}
            className={`hover:text-white transition-colors text-sm font-medium ${
              location.pathname === "/history"
                ? "text-white"
                : "text-text-dim"
            }`}
          >
            History
          </button>
          <button
            onClick={() => handleNavigate("/about")}
            className={`hover:text-white transition-colors text-sm font-medium ${
              location.pathname === "/about"
                ? "text-white"
                : "text-text-dim"
            }`}
          >
            About
          </button>
        </nav>

        {/* Right — Mobile menu */}
        <div className="flex items-center justify-end gap-4">
          <button
            className="md:hidden text-white"
            onClick={() => handleNavigate("/history")}
          >
            <span className="material-symbols-outlined">history</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow pt-[72px]">{children}</main>

      {/* Floating PiP player */}
      <PiPPlayer />

      {/* Footer */}
      <footer className="w-full border-t border-surface-border bg-surface-darker py-6 px-6 mt-auto relative z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <p className="text-text-dim text-xs opacity-60">
            Powered by{" "}
            <span className="text-accent-blue font-medium">ShazamIO</span> &{" "}
            <span className="text-accent-blue font-medium">AnimeThemes</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
