import { useEffect, useMemo, useState } from 'react';
import HeroCover from './components/HeroCover';
import WalletPanel from './components/WalletPanel';
import MarketsTable from './components/MarketsTable';
import OpportunityScanner from './components/OpportunityScanner';

const DEFAULT_DEXES = [
  { id: 'uni', name: 'Uniswap', takerFeeBps: 30 },
  { id: 'sushi', name: 'SushiSwap', takerFeeBps: 25 },
  { id: 'pancake', name: 'PancakeSwap', takerFeeBps: 20 },
];

const DEFAULT_PAIRS = [
  { id: 'ETH-USDC', base: 'ETH', quote: 'USDC', baseDecimals: 18, quoteDecimals: 6 },
  { id: 'BTC-USDC', base: 'BTC', quote: 'USDC', baseDecimals: 8, quoteDecimals: 6 },
  { id: 'SOL-USDC', base: 'SOL', quote: 'USDC', baseDecimals: 9, quoteDecimals: 6 },
];

function generateInitialPrices() {
  // Base reference prices
  const refs = {
    'ETH-USDC': 3200,
    'BTC-USDC': 65000,
    'SOL-USDC': 180,
  };
  const prices = {};
  for (const pair of DEFAULT_PAIRS) {
    prices[pair.id] = {};
    for (const dex of DEFAULT_DEXES) {
      // Create slight variation per dex
      const skew = 1 + (Math.random() - 0.5) * 0.01; // ±0.5%
      const ref = refs[pair.id] * skew;
      prices[pair.id][dex.id] = {
        bid: ref * (1 - (Math.random() * 0.002)),
        ask: ref * (1 + (Math.random() * 0.002)),
      };
    }
  }
  return prices;
}

export default function App() {
  const [dexes, setDexes] = useState(DEFAULT_DEXES);
  const [pairs, setPairs] = useState(DEFAULT_PAIRS);
  const [prices, setPrices] = useState(generateInitialPrices);
  const [scanning, setScanning] = useState(true);

  // Wallet + settings
  const [wallet, setWallet] = useState({ connected: false, address: '', balances: { USDC: 50000, ETH: 10, BTC: 1, SOL: 200 } });
  const [slippageBps, setSlippageBps] = useState(30); // 0.30%
  const [networkFeeUSD, setNetworkFeeUSD] = useState(5); // flat per round trip
  const [tradeSizes, setTradeSizes] = useState({ 'ETH-USDC': 2000, 'BTC-USDC': 3000, 'SOL-USDC': 1500 });

  // Price jitter simulator
  useEffect(() => {
    if (!scanning) return;
    const id = setInterval(() => {
      setPrices((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((pairId) => {
          const dexMap = next[pairId];
          Object.keys(dexMap).forEach((dexId) => {
            const { bid, ask } = dexMap[dexId];
            // Random walk
            const drift = (Math.random() - 0.5) * 0.003; // ±0.3%
            const mid = (bid + ask) / 2;
            const newMid = mid * (1 + drift);
            const spread = Math.max(0.0008, (ask - bid) / mid); // keep reasonable spread
            dexMap[dexId] = {
              bid: newMid * (1 - spread / 2) * (1 - Math.random() * 0.0005),
              ask: newMid * (1 + spread / 2) * (1 + Math.random() * 0.0005),
            };
          });
        });
        return { ...next };
      });
    }, 2000);
    return () => clearInterval(id);
  }, [scanning]);

  // Derived best quotes per pair
  const bestQuotes = useMemo(() => {
    const result = {};
    for (const pair of pairs) {
      let bestBid = { dex: null, price: -Infinity };
      let bestAsk = { dex: null, price: Infinity };
      for (const d of dexes) {
        const q = prices[pair.id]?.[d.id];
        if (!q) continue;
        if (q.bid > bestBid.price) bestBid = { dex: d, price: q.bid };
        if (q.ask < bestAsk.price) bestAsk = { dex: d, price: q.ask };
      }
      result[pair.id] = { bestBid, bestAsk };
    }
    return result;
  }, [pairs, dexes, prices]);

  return (
    <div className="min-h-screen bg-black text-white">
      <HeroCover onToggleScan={() => setScanning((s) => !s)} scanning={scanning} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-10">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OpportunityScanner
              pairs={pairs}
              dexes={dexes}
              prices={prices}
              bestQuotes={bestQuotes}
              slippageBps={slippageBps}
              networkFeeUSD={networkFeeUSD}
              tradeSizes={tradeSizes}
              wallet={wallet}
            />
          </div>
          <div className="lg:col-span-1">
            <WalletPanel
              wallet={wallet}
              setWallet={setWallet}
              dexes={dexes}
              setDexes={setDexes}
              slippageBps={slippageBps}
              setSlippageBps={setSlippageBps}
              networkFeeUSD={networkFeeUSD}
              setNetworkFeeUSD={setNetworkFeeUSD}
              tradeSizes={tradeSizes}
              setTradeSizes={setTradeSizes}
              pairs={pairs}
            />
          </div>
        </section>

        <section className="mt-8">
          <MarketsTable pairs={pairs} dexes={dexes} prices={prices} />
        </section>

        <section className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60">
          <p>
            This interface is a simulation for educational purposes and does not execute real trades. Crypto markets are volatile; do your own research and manage risk.
          </p>
        </section>
      </main>
    </div>
  );
}
