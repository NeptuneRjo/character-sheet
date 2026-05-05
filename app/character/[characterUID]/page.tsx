import { CharacterSheet } from "./components";

export default async function Page({
  params,
}: {
  params: { characterUID: string };
}) {
  const { characterUID } = await params;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f1a14,_#14100c_45%,_#0b0907_100%)] px-6 py-20 text-[#e6d9c5]">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <a
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b7a387] hover:text-[#f0d9a8]"
        >
          ← Back to selection
        </a>
        <CharacterSheet characterUID={characterUID} />
      </main>
    </div>
  );
}
