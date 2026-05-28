export default function StatsPanel({ stats = {}, circularDeps = [] }) {
  const cards = [
    { label: 'Total Files', value: stats.totalFiles ?? 0 },
    { label: 'Dependencies', value: stats.totalEdges ?? 0 },
    { label: 'Avg Connections', value: stats.avgConnections?.toFixed(1) ?? '0.0' },
    { label: 'Circular Deps', value: circularDeps.length },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-white/8 bg-white/5 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{card.label}</p>
            <p className="mt-2 text-2xl font-bold text-white">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-white/8 bg-white/5 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">Languages</h4>
        <div className="space-y-2">
          {Object.entries(stats.languages || {}).map(([ext, count]) => (
            <div key={ext} className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">{ext}</span>
              <span className="text-zinc-100">{count} files</span>
            </div>
          ))}
        </div>
      </div>

      {circularDeps.length > 0 ? (
        <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 shadow-[0_20px_60px_rgba(127,29,29,0.25)] backdrop-blur-xl">
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-200">
            ⚠ Circular Dependencies
          </h4>
          <div className="space-y-1">
            {circularDeps.map((cycle, index) => (
              <p key={`${index}-${cycle.join('-')}`} className="text-xs text-red-100/80">
                {cycle.join(' → ')}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}