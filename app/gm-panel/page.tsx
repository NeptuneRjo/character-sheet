import { GMPanel } from "./components";

export default function GMPanelPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f1a14,_#14100c_45%,_#0b0907_100%)] px-6 py-20 text-[#e6d9c5]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <a
          href="/"
          className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b7a387] hover:text-[#f0d9a8]"
        >
          ← Back to selection
        </a>
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b7a387]">
            GM Panel
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#f0e4cf]">
            Party Overview
          </h1>
          <p className="text-sm text-[#b7a387]">
            Update character values and pass turns to reset AP and tick wounds.
          </p>
        </header>
        <GMPanel />
      </main>
    </div>
  );
}
