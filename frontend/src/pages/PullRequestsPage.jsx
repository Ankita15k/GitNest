import { useMemo, useState } from 'react';
import { GitPullRequest, XCircle, Search, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PRCard from '../components/PRCard';
import { fetchPullRequests } from '../api/pullRequestApi.js';
import ErrorState from '../components/ui/ErrorState.jsx';
import Spinner from '../components/ui/Spinner.jsx';

export default function PullRequestsPage() {
  const [activeTab, setActiveTab] = useState('open');
  const [search, setSearch] = useState('');
  const queryStatus = activeTab === 'open' ? 'open' : 'all';
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pull-requests', queryStatus, search],
    queryFn: () => fetchPullRequests({ status: queryStatus, search }),
  });

  const filtered = useMemo(() => {
    const pullRequests = data?.pullRequests ?? [];
    return activeTab === 'open' ? pullRequests : pullRequests.filter((pr) => pr.status !== 'open');
  }, [activeTab, data?.pullRequests]);

  const openCount = data?.counts?.open ?? 0;
  const closedCount = (data?.counts?.closed ?? 0) + (data?.counts?.merged ?? 0);

  return (
    <div className="min-h-screen bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-medium">Pull Requests</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <GitPullRequest className="w-8 h-8 text-emerald-400" />
            Pull Requests
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Review, discuss, and merge code changes from contributors.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search pull requests..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-emerald-400/50 transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.03] text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.06] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
          <div className="flex items-center border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] px-4">
            <button onClick={() => setActiveTab('open')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'open' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
              <GitPullRequest className="w-4 h-4" />
              Open
              <span className="px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs">{openCount}</span>
            </button>
            <button onClick={() => setActiveTab('closed')} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'closed' ? 'border-zinc-400 text-zinc-300' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>
              <XCircle className="w-4 h-4" />
              Closed
              <span className="px-2 py-0.5 rounded-full bg-zinc-400/10 text-zinc-400 text-xs">{closedCount}</span>
            </button>
          </div>
          {isLoading ? (
            <div className="py-16 flex justify-center"><Spinner /></div>
          ) : isError ? (
            <div className="p-6"><ErrorState message={error?.message || 'Could not load pull requests.'} /></div>
          ) : filtered.length > 0 ? (
            filtered.map((pr) => <PRCard key={pr.id || pr._id} pr={pr} />)
          ) : (
            <div className="py-16 text-center text-zinc-500 text-sm">
              <GitPullRequest className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
              No pull requests found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
