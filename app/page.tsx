import GameController from "@/presentation/components/game-controller/GameController";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[url('/images/stars.svg')] bg-repeat opacity-20 pointer-events-none"></div>

      {/* Header/Title Section */}
      <header className="relative z-10 pt-8 pb-6 px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 font-kanit tracking-wide">
          RPG World Explorer
        </h1>
        <p className="text-lg md:text-xl text-amber-100/80 max-w-2xl mx-auto font-kanit">
          Embark on an epic journey through mysterious lands and dangerous
          dungeons
        </p>
      </header>

      {/* Main Game Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-slate-800/70 backdrop-blur-sm rounded-lg border border-amber-500/30 shadow-lg shadow-purple-500/20 overflow-hidden">
          <div className="p-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500">
            <div className="bg-slate-900 p-4">
              <GameController />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center p-4 text-amber-200/60 text-sm">
        <p>
          © {new Date().getFullYear()} RPG World Explorer | Your Fantasy
          Adventure Awaits
        </p>
      </footer>
    </div>
  );
}
