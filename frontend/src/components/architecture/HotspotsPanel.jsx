export default function HotspotsPanel({ hotspots = [] }) {
  if (!hotspots.length) return null;

  return (
    <div className="rounded-3xl border border-white/8 bg-white/5 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.25)] backdrop-blur-xl">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-amber-300">
        <span>🔥</span>
        Contribution Hotspots
      </h3>

      <div className="space-y-3">
        {hotspots.map((file, index) => (
          <div key={file.id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="w-5 text-xs text-zinc-500">{index + 1}</span>
              <span className="truncate text-sm text-zinc-200">{file.name}</span>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                style={{ width: `${Math.min((file.connections || 0) * 10, 96)}px` }}
              />
              <span className="text-xs text-zinc-400">{file.connections}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}