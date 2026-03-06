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
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-10 border-b border-surface-border backdrop-blur-md bg-background-dark/80">
        {/* Left — Logo */}
        <button
          type="button"
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity text-left"
          onClick={() => handleNavigate("/")}
        >
          <h2 className="text-xl font-bold tracking-tight uppercase">
            <span className="text-primary">SHAZ</span>
            <span className="text-white">ANIME</span>
          </h2>
        </button>

        {/* Right — Nav */}
        <nav className="flex items-center justify-end gap-6 md:gap-8">
          <button
            onClick={() => handleNavigate("/")}
            className={`hover:text-white transition-colors text-sm font-medium uppercase ${
              location.pathname === "/" ? "text-white" : "text-text-dim"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavigate("/history")}
            className={`hover:text-white transition-colors text-sm font-medium uppercase flex items-center gap-1 ${
              location.pathname === "/history" ? "text-white" : "text-text-dim"
            }`}
          >
            <span className="md:hidden material-symbols-outlined text-lg">history</span>
            <span>History</span>
          </button>
          <button
            onClick={() => handleNavigate("/about")}
            className={`hover:text-white transition-colors text-sm font-medium uppercase ${
              location.pathname === "/about" ? "text-white" : "text-text-dim"
            }`}
          >
            About
          </button>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-grow pt-[72px]">{children}</main>

      {/* Floating PiP player */}
      <PiPPlayer />

      {/* Footer — hidden on results page so video layout fills exact viewport */}
      {location.pathname !== "/results" && (
        <footer className="w-full border-t border-surface-border bg-surface-darker py-6 px-6 mt-auto relative z-10">
          <div className="max-w-6xl mx-auto flex items-center justify-center">
            <p className="text-text-dim text-xs opacity-60">
              Powered by{" "}
              <span className="text-accent-blue font-medium">ShazamIO</span> &{" "}
              <span className="text-accent-blue font-medium">AnimeThemes</span>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
