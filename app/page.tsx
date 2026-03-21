import { Dashboard } from "@/components";

export default async function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f1a14,_#14100c_45%,_#0b0907_100%)] text-[#e6d9c5]">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col items-center justify-center px-6 py-20">
        <div className="mb-10 text-center">
          <h1 className="text-lg font-semibold uppercase tracking-[0.2em] text-[#c7b08b]">
            Select a sheet below to open your character page.
          </h1>
          <div className="mt-6 flex justify-center">
            <a
              href="/gm-panel"
              className="rounded-full border border-[#8b6a3f] bg-[#19130d] px-6 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f0d9a8] transition hover:border-[#c7a76a] hover:text-[#f7e6bf]"
            >
              GM Panel
            </a>
          </div>
        </div>
        <Dashboard />
      </main>
    </div>
  );
}
