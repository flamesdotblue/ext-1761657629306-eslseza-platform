import { useMemo, useState } from 'react';
import { RefreshCw, TrendingUp } from 'lucide-react';

function calcNetEdge({ bestBid, bestAsk, takerFeeBuyBps, takerFeeSellBps, slippageBps, networkFeeUSD, notionalUSD }) {
  if (!bestBid?.price || !bestAsk?.price) return { gross: 0, net: -Infinity, details: null };
  const grossSpread = (bestBid.price - bestAsk.price) / bestAsk.price; // relative

  // Fees: apply taker fees on both legs, plus slippage on both legs (bps both directions)
  const feeBuy = takerFeeBuyBps / 10000;
  const feeSell = takerFeeSellBps / 10000;
  const slip = slippageBps / 10000;

  const totalPctCosts = feeBuy + feeSell + slip * 2; // approximation

  // Convert to USD PnL
  const grossUSD = notionalUSD * grossSpread;
  const pctCostUSD = notionalUSD * totalPctCosts;
  const netUSD = grossUSD - pctCostUSD - networkFeeUSD;
  const netPct = netUSD / notionalUSD;

  return {
    gross: grossSpread,
    net: netPct,
    details: { grossUSD, pctCostUSD, netUSD },
  };
}

export default function OpportunityScanner({ pairs, dexes, prices, bestQuotes, slippageBps, networkFeeUSD, tradeSizes, wallet }) {
  const [lastSim, setLastSim] = useState(null);

  const opportunities = useMemo(() => {
    return pairs.map((p) => {
      const { bestBid, bestAsk } = bestQuotes[p.id] || {};
      const takerFeeBuyBps = bestAsk?.dex?.takerFeeBps ?? 0;
      const takerFeeSellBps = bestBid?.dex?.takerFeeBps ?? 0;
      const notionalUSD = tradeSizes[p.id] ?? 0;
      const res = calcNetEdge({
        bestBid,
        bestAsk,
        takerFeeBuyBps,
        takerFeeSellBps,
        slippageBps,
        networkFeeUSD,
        notionalUSD,
      });
      return {
        pair: p.id,
        buyOn: bestAsk.dex,
        sellOn: bestBid.dex,
        buyPrice: bestAsk.price,
        sellPrice: bestBid.price,
        gross: res.gross,
        net: res.net,
        netUSD: res.details?.netUSD ?? 0,
        notionalUSD,
      };
    }).sort((a, b) => b.net - a.net);
  }, [pairs, bestQuotes, slippageBps, networkFeeUSD, tradeSizes]);

  const profitable = opportunities.filter((o) => isFinite(o.net) && o.net > 0 && o.notionalUSD > 0);

  const simulate = (opp) => {
    const baseBought = opp.notionalUSD / opp.buyPrice; // approximate ignores pool impact beyond slippage model
    const usdFromSell = baseBought * opp.sellPrice;
    const netUSD = opp.netUSD;
    const success = netUSD > 0 && wallet.connected;
    setLastSim({ time: new Date().toISOString(), opp, baseBought, usdFromSell, success });
  };

  return (
    <section id="opps" className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2"><TrendingUp size={18}/>Arbitrage Opportunities</h3>
        <div className="text-xs text-white/60 flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin-slow" /> auto-refreshing
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {opportunities.map((o) => (
          <div key={o.pair} className="rounded-lg border border-white/10 bg-black/40 p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{o.pair}</div>
                <div className="text-xs text-white/60">Buy on {o.buyOn?.name} @ {o.buyPrice.toFixed(2)} • Sell on {o.sellOn?.name} @ {o.sellPrice.toFixed(2)}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className={`text-sm ${o.gross >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>Gross {(o.gross * 100).toFixed(2)}%</div>
                  <div className={`text-sm ${o.net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>Net {(o.net * 100).toFixed(2)}% ({o.netUSD >= 0 ? '+' : ''}{o.netUSD.toFixed(2)} USD)</div>
                </div>
                <button
                  onClick={() => simulate(o)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${o.net > 0 ? 'bg-emerald-400 text-black hover:bg-emerald-300' : 'bg-white/10 text-white/70 cursor-pointer hover:bg-white/15'}`}
                >
                  Simulate Trade
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="mt-4 text-sm text-white/60">No data available.</div>
      )}

      <div className="mt-4 rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/80">
        <div className="font-medium mb-1">How this works</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Gross edge is computed from best cross-DEX bid vs ask for each pair.</li>
          <li>Net edge subtracts taker fees on both legs, slippage tolerance (bps), and a flat round-trip network fee.</li>
          <li>This is a model; real execution involves liquidity depth, MEV, latency, and failure risk.</li>
        </ul>
      </div>

      {lastSim && (
        <div className={`mt-4 rounded-lg border ${lastSim.success ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' : 'border-rose-500/30 bg-rose-500/10 text-rose-100'} p-3 text-xs`}>
          <div className="flex items-center justify-between">
            <div className="font-medium">Simulation Result</div>
            <div className="text-white/60">{new Date(lastSim.time).toLocaleTimeString()}</div>
          </div>
          <div className="mt-1">
            {lastSim.success ? (
              <div>
                Simulated arbitrage on {lastSim.opp.pair}: bought ~{lastSim.baseBought.toFixed(6)} base, sold for ${lastSim.usdFromSell.toFixed(2)}. Estimated PnL: {lastSim.opp.netUSD >= 0 ? '+' : ''}${lastSim.opp.netUSD.toFixed(2)}.
              </div>
            ) : (
              <div>
                Simulation suggests a loss or wallet not connected. Connect wallet and ensure positive net edge to proceed (demo only; no real trades).
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
