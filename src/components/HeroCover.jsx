import Spline from '@splinetool/react-spline';
import { Rocket } from 'lucide-react';

export default function HeroCover({ onToggleScan, scanning }) {
  return (
    <header className="relative w-full h-[70vh] overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/44zrIZf-iQZhbQNQ/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/40 to-black" />

      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Arbitrage Monitor
            </div>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
              Capture DEX price dislocations
            </h1>
            <p className="mt-4 text-white/80 text-base sm:text-lg">
              Scan multiple decentralized exchanges, quantify net spreads after fees and slippage, and simulate execution strategies.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={onToggleScan}
                className="inline-flex items-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90 transition"
              >
                <Rocket size={16} /> {scanning ? 'Pause Scanner' : 'Resume Scanner'}
              </button>
              <a
                href="#opps"
                className="inline-flex items-center gap-2 rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
              >
                View Opportunities
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
