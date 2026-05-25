import { GitPullRequest, GitMerge, XCircle, Clock, User, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getApiUserName } from '../utils/apiContracts.js';

const statusConfig = {
  open: {
    icon: <GitPullRequest className="w-4 h-4" />,
    label: 'Open',
    classes: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20',
  },
  merged: {
    icon: <GitMerge className="w-4 h-4" />,
    label: 'Merged',
    classes: 'bg-purple-400/10 text-purple-400 border border-purple-400/20',
  },
  closed: {
    icon: <XCircle className="w-4 h-4" />,
    label: 'Closed',
    classes: 'bg-red-400/10 text-red-400 border border-red-400/20',
  },
};

const getTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

export default function PRCard({ pr }) {
  const navigate = useNavigate();
  const config = statusConfig[pr.status] || statusConfig.open;
  const author = getApiUserName(pr.author);
  const commentCount = Array.isArray(pr.comments) ? pr.comments.length : Number(pr.comments || 0);
  const fromBranch = pr.fromBranch || pr.sourceBranch;
  const toBranch = pr.toBranch || pr.targetBranch;

  return (
    <div
      onClick={() => navigate(`/pull-requests/${pr.id || pr._id}`)}
      className="group flex items-start gap-4 px-5 py-4 border-b border-zinc-200 dark:border-white/5 hover:bg-zinc-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors"
    >
      {/* Status Icon */}
      <div className={`mt-0.5 flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${config.classes}`}>
        {config.icon}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-semibold text-zinc-900 dark:text-white group-hover:text-emerald-400 transition-colors truncate">
            {pr.title}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
            {config.icon}
            {config.label}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1">
            <span className="font-mono text-zinc-400">#{pr.number}</span>
          </span>
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {author}
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="w-3 h-3" />
            <span className="font-mono">{fromBranch}</span>
            <span className="text-zinc-600">→</span>
            <span className="font-mono">{toBranch}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {getTimeAgo(pr.createdAt)}
          </span>
        </div>
      </div>

      {/* Comment count */}
      {commentCount > 0 && (
        <div className="flex-shrink-0 flex items-center gap-1 text-xs text-zinc-500">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 8l4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          {commentCount}
        </div>
      )}
    </div>
  );
}
