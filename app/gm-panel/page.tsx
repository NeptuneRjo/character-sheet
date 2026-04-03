import { GMPanel } from "./components";

export default function GMPanelPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#1f1a14,_#14100c_45%,_#0b0907_100%)] px-6 py-20 text-[#e6d9c5]">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <GMPanel />
      </main>
    </div>
  );
}
