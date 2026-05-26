import { useMemo } from 'react';

const EXTENSION_COLORS = {
  '.jsx': '#61dafb',
  '.js': '#facc15',
  '.ts': '#60a5fa',
  '.tsx': '#38bdf8',
  '.py': '#3b82f6',
  '.java': '#f97316',
  '.go': '#22c55e',
  '.rb': '#fb7185',
};

const getNodeColor = (ext) => EXTENSION_COLORS[ext] || '#6b7280';

const layoutNodes = (nodes, width, height) => {
  const radius = Math.min(width, height) * 0.32;

  return nodes.map((node, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2;
    const x = width / 2 + Math.cos(angle) * radius;
    const y = height / 2 + Math.sin(angle) * radius;

    return {
      ...node,
      x,
      y,
    };
  });
};

export default function DependencyGraph({ nodes = [], edges = [] }) {
  const width = 900;
  const height = 640;

  const positionedNodes = useMemo(() => layoutNodes(nodes, width, height), [nodes]);
  const nodeById = useMemo(
    () => new Map(positionedNodes.map((node) => [node.id, node])),
    [positionedNodes]
  );

  if (!positionedNodes.length) {
    return (
      <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-white/10 bg-slate-950/95 text-sm text-zinc-400">
        No dependency data found yet.
      </div>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-full w-full rounded-3xl bg-slate-950/95"
      role="img"
      aria-label="Repository dependency graph"
    >
      <defs>
        <linearGradient id="graphEdge" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#64748b" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.2" />
        </linearGradient>
        <filter id="nodeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 0.4 0"
          />
        </filter>
      </defs>

      <circle cx={width / 2} cy={height / 2} r="150" fill="none" stroke="rgba(34,197,94,0.08)" />
      <circle cx={width / 2} cy={height / 2} r="250" fill="none" stroke="rgba(96,165,250,0.06)" />

      {edges.map((edge, index) => {
        const source = nodeById.get(edge.source);
        const target = nodeById.get(edge.target);

        if (!source || !target) return null;

        return (
          <line
            key={`${edge.source}-${edge.target}-${index}`}
            x1={source.x}
            y1={source.y}
            x2={target.x}
            y2={target.y}
            stroke="url(#graphEdge)"
            strokeWidth="1.25"
            strokeOpacity="0.7"
          />
        );
      })}

      {positionedNodes.map((node) => {
        const radius = Math.min(8 + (node.importCount || 0) * 1.3, 18);

        return (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            <circle
              r={radius + 4}
              fill={getNodeColor(node.ext)}
              opacity="0.14"
              filter="url(#nodeGlow)"
            />
            <circle
              r={radius}
              fill={getNodeColor(node.ext)}
              stroke="#0f172a"
              strokeWidth="1.5"
            >
              <title>{`${node.name}\nImports: ${node.importCount || 0}`}</title>
            </circle>
          </g>
        );
      })}
    </svg>
  );
}