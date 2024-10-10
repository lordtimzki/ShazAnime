import RecordButton from "../components/RecordButton";

export default function Home() {
  return (
    <div className="flex items-center justify-center">
      <main className="flex flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">ShazAnime</h1>
        <p className="text-xl italic mb-8">
          Find the opening/ending visual to the song!
        </p>
        <RecordButton />
      </main>
    </div>
  );
}
