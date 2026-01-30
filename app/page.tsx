export default function Home() {
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

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { name: "Elric", href: "/elric" },
            { name: "Zinrie", href: "/zinrie" },
            { name: "Aled", href: "/aled" },
            { name: "Verso", href: "/verso" },
            { name: "Cerid", href: "/cerid" },
          ].map((character) => (
            <a
              key={character.name}
              href={character.href}
              className="group flex items-center justify-between rounded-2xl border border-[#5c4a33] bg-[#19130d] px-6 py-5 text-left shadow-[0_12px_32px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-[#8b6a3f] hover:bg-[#21180f] hover:shadow-[0_16px_36px_rgba(0,0,0,0.45)]"
            >
              <div>
                <p className="text-lg font-semibold text-[#f0e4cf]">
                  {character.name}
                </p>
                <p className="text-sm text-[#b7a387]">Open character sheet</p>
              </div>
              <span className="text-sm font-medium text-[#b08a5a] transition group-hover:text-[#f0d9a8]">
                View →
              </span>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
