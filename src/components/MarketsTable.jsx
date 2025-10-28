export default function MarketsTable({ pairs, dexes, prices }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Live Market Quotes</h3>
        <div className="text-xs text-white/60">Bid/Ask per DEX (simulated)</div>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-white/60">
              <th className="px-3 py-2 text-left">Pair</th>
              {dexes.map((d) => (
                <th key={d.id} className="px-3 py-2 text-left">{d.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => (
              <tr key={p.id} className="border-t border-white/10">
                <td className="px-3 py-3 font-medium">{p.id}</td>
                {dexes.map((d) => {
                  const q = prices[p.id]?.[d.id];
                  return (
                    <td key={d.id} className="px-3 py-3">
                      {q ? (
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-300 px-2 py-0.5">Bid {q.bid.toFixed(2)}</span>
                          <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 text-rose-300 px-2 py-0.5">Ask {q.ask.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="text-white/40">-</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
