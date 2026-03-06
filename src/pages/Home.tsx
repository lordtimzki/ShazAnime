import RecordButton from "../components/RecordButton";

export default function Home() {
  return (
    <div className="relative flex flex-col items-center justify-center px-4 bg-anime-pattern overflow-hidden h-[calc(100vh-72px)]">
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto w-full">
        {/* Title */}
        <div className="mb-16 space-y-4">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">
            <span className="text-primary">SHAZ</span>
            <span className="text-white">ANIME</span>
          </h1>
          <p className="text-text-dim text-lg md:text-xl font-normal max-w-md mx-auto leading-relaxed">
            Tap to identify anime openings and endings.
          </p>
        </div>

        {/* Record button */}
        <RecordButton />
      </div>
    </div>
  );
}
