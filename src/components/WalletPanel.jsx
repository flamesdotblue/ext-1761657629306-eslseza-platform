import { useMemo } from 'react';
import { Wallet, Settings } from 'lucide-react';

export default function WalletPanel({ wallet, setWallet, dexes, setDexes, slippageBps, setSlippageBps, networkFeeUSD, setNetworkFeeUSD, tradeSizes, setTradeSizes, pairs }) {
  const shortAddr = useMemo(() => wallet.address ? wallet.address.slice(0, 6) + '...' + wallet.address.slice(-4) : '', [wallet.address]);

  const connect = () => {
    if (wallet.connected) {
      setWallet({ ...wallet, connected: false, address: '' });
    } else {
      const addr = '0x' + Math.random().toString(16).slice(2, 10) + Math.random().toString(16).slice(2, 10);
      setWallet({ ...wallet, connected: true, address: addr });
    }
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-medium">
          <Wallet size={18} /> Wallet & Settings
        </h3>
        <button onClick={connect} className="rounded-md bg-white text-black px-3 py-1.5 text-xs font-medium hover:bg-white/90">
          {wallet.connected ? `Disconnect (${shortAddr})` : 'Connect Wallet'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <div className="text-white/60 text-xs">Balances (simulated)</div>
          <div className="mt-2 space-y-1">
            <div className="flex justify-between"><span>USDC</span><span>{wallet.balances.USDC.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>ETH</span><span>{wallet.balances.ETH}</span></div>
            <div className="flex justify-between"><span>BTC</span><span>{wallet.balances.BTC}</span></div>
            <div className="flex justify-between"><span>SOL</span><span>{wallet.balances.SOL}</span></div>
          </div>
        </div>
        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <div className="flex items-center gap-2 text-white/60 text-xs"><Settings size={14}/>Trade Settings</div>
          <div className="mt-2 space-y-2">
            <label className="flex items-center justify-between gap-2 text-xs">
              <span>Slippage tolerance</span>
              <div className="flex items-center gap-2">
                <input type="number" value={slippageBps} onChange={(e)=>setSlippageBps(Math.max(0, Number(e.target.value)))} className="w-20 bg-transparent border border-white/10 rounded px-2 py-1 text-right" />
                <span className="text-white/60">bps</span>
              </div>
            </label>
            <label className="flex items-center justify-between gap-2 text-xs">
              <span>Network fee (round trip)</span>
              <div className="flex items-center gap-2">
                <input type="number" value={networkFeeUSD} onChange={(e)=>setNetworkFeeUSD(Math.max(0, Number(e.target.value)))} className="w-20 bg-transparent border border-white/10 rounded px-2 py-1 text-right" />
                <span className="text-white/60">USD</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="text-xs text-white/60">Per-Pair Trade Size (quote)</div>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {pairs.map((p) => (
            <label key={p.id} className="flex items-center justify-between gap-2 text-xs rounded-lg border border-white/10 bg-black/40 p-2">
              <span>{p.id}</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={tradeSizes[p.id] ?? 0}
                  onChange={(e) => setTradeSizes({ ...tradeSizes, [p.id]: Math.max(0, Number(e.target.value)) })}
                  className="w-28 bg-transparent border border-white/10 rounded px-2 py-1 text-right"
                />
                <span className="text-white/60">USDC</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-200">
        Tip: Profitable arbitrage usually requires low latency, atomic execution, and precise fee modeling. This demo estimates net edge after taker fees, slippage, and a flat network fee.
      </div>
    </div>
  );
}
