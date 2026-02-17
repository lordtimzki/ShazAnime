import RecordButton from "../components/RecordButton";

export default function Home() {
  return (
    <div className="relative flex-grow flex flex-col items-center justify-center px-4 bg-anime-pattern overflow-hidden min-h-[calc(100vh-72px)]">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none bg-grid-overlay opacity-30"></div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Spinning SVG arcs */}
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-20 animate-[spin_60s_linear_infinite]"
          viewBox="0 0 100 100"
        >
          <path
            d="M50 10 A40 40 0 0 1 90 50"
            fill="none"
            stroke="#40c4ff"
            strokeWidth="0.2"
          />
          <path
            d="M50 90 A40 40 0 0 1 10 50"
            fill="none"
            stroke="#40c4ff"
            strokeWidth="0.2"
          />
          <circle
            cx="50"
            cy="50"
            r="30"
            fill="none"
            stroke="#0088ff"
            strokeDasharray="2 4"
            strokeWidth="0.1"
          />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#0088ff"
            strokeWidth="0.1"
          />
        </svg>
        {/* Blurred glow blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[80px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto w-full">
        {/* Title */}
        <div className="mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(0,136,255,0.3)]">
            ShazAnime
          </h1>
          <p className="text-text-dim text-lg md:text-xl font-normal max-w-md mx-auto leading-relaxed">
            Tap to identify anime openings and endings from the deep blue sea of
            sound.
          </p>
        </div>

        {/* Record button */}
        <RecordButton />

        {/* Waveform bars */}
        <div className="mt-32 w-full max-w-md h-16 flex items-end justify-center gap-1.5 opacity-60">
          {[6, 10, 8, 14, 7, 4, 10, 6, 12, 7, 3].map((h, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-primary to-accent-blue rounded-full animate-bounce"
              style={{
                height: `${h * 4}px`,
                animationDuration: `${0.8 + (i % 5) * 0.1}s`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
