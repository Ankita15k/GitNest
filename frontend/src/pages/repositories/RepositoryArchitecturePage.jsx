import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Activity, ArrowLeft, Search } from 'lucide-react';
import { analyzeRepo } from '../../api/architecture.api.js';
import DependencyGraph from '../../components/architecture/DependencyGraph.jsx';
import HotspotsPanel from '../../components/architecture/HotspotsPanel.jsx';
import StatsPanel from '../../components/architecture/StatsPanel.jsx';
import PageShell from '../../components/layout/PageShell.jsx';

export default function RepositoryArchitecturePage() {
  const { owner, repo } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await analyzeRepo(owner, repo);
      setData(result);
    } catch (analysisError) {
      setError(analysisError?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(180deg,_rgba(2,6,23,1),_rgba(2,6,23,0.92))]" />

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm text-zinc-400">
                <Link to={`/${owner}`} className="inline-flex items-center gap-1 hover:text-emerald-300 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  {owner}
                </Link>
                <span>/</span>
                <span className="text-zinc-200">{repo}</span>
                <span>/</span>
                <span className="text-emerald-300">Architecture</span>
              </div>
              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                <Activity className="h-9 w-9 text-emerald-300" />
                Repository Architecture
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-zinc-400 sm:text-base">
                Scan the dependency graph, surface hotspots, and spot circular imports in {owner}/{repo}.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Search className="h-4 w-4" />
              {loading ? 'Analyzing...' : 'Analyze Repository'}
            </button>
          </div>

          {error ? (
            <div className="mb-6 rounded-3xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          {!data && !loading ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-[2rem] border border-white/8 bg-white/5 px-6 text-center shadow-[0_30px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <div className="mb-4 rounded-full border border-emerald-400/20 bg-emerald-400/10 p-5 text-4xl">
                🧭
              </div>
              <h2 className="text-2xl font-bold text-white">No analysis yet</h2>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Click Analyze Repository to clone the repo, parse imports, and build the dependency view.
              </p>
            </div>
          ) : null}

          {loading ? (
            <div className="flex min-h-[460px] flex-col items-center justify-center rounded-[2rem] border border-white/8 bg-white/5 px-6 text-center shadow-[0_30px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl">
              <div className="mb-4 text-5xl animate-pulse">⚙️</div>
              <p className="text-lg font-medium text-white">Cloning and analyzing repository...</p>
              <p className="mt-2 text-sm text-zinc-400">Large repositories can take a little longer.</p>
            </div>
          ) : null}

          {data ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
              <div className="min-h-[640px] overflow-hidden rounded-[2rem] border border-white/8 bg-white/5 shadow-[0_30px_80px_rgba(15,23,42,0.2)] backdrop-blur-xl">
                <DependencyGraph nodes={data.graph?.nodes} edges={data.graph?.edges} />
              </div>

              <div className="space-y-4">
                <StatsPanel stats={data.stats} circularDeps={data.circularDeps} />
                <HotspotsPanel hotspots={data.hotspots} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}