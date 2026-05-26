import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Clock, GitBranch, GitMerge, GitPullRequest, MessageSquare, Send, User, XCircle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { addPullRequestComment, fetchPullRequest, submitPullRequestReview } from '../api/pullRequestApi.js';
import { getApiUserAvatar, getApiUserName } from '../utils/apiContracts.js';
import ErrorState from '../components/ui/ErrorState.jsx';
import Spinner from '../components/ui/Spinner.jsx';

const statusConfig = {
  open: { icon: <GitPullRequest className="w-4 h-4" />, label: 'Open', classes: 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' },
  merged: { icon: <GitMerge className="w-4 h-4" />, label: 'Merged', classes: 'bg-purple-400/10 text-purple-400 border border-purple-400/20' },
  closed: { icon: <XCircle className="w-4 h-4" />, label: 'Closed', classes: 'bg-red-400/10 text-red-400 border border-red-400/20' },
};

const getTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

function DiffChunk({ file }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-white/10 overflow-hidden mb-4">
      <button type="button" className="w-full flex items-center justify-between px-4 py-2.5 bg-zinc-100 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/10" onClick={() => setCollapsed(!collapsed)}>
        <span className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{file.file}</span>
        {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
      </button>
      {!collapsed && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <tbody>
              {(file.chunks || []).map((chunk, index) => (
                <tr key={`${file.file}-${chunk.line}-${index}`} className={chunk.type === 'added' ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : chunk.type === 'removed' ? 'bg-red-500/5 dark:bg-red-500/10' : ''}>
                  <td className="w-12 px-3 py-1 text-right text-zinc-400 select-none border-r border-zinc-200 dark:border-white/5">{chunk.line}</td>
                  <td className="w-6 px-2 py-1 text-center select-none">{chunk.type === 'added' ? '+' : chunk.type === 'removed' ? '-' : ' '}</td>
                  <td className="px-3 py-1 text-zinc-800 dark:text-zinc-200 whitespace-pre">{chunk.content}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CommentItem({ comment }) {
  const author = getApiUserName(comment.author);
  return (
    <div className="flex gap-3 py-4 border-b border-zinc-200 dark:border-white/5 last:border-0">
      <div className="w-8 h-8 rounded-full bg-emerald-400/20 border border-emerald-400/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">{getApiUserAvatar(comment.author)}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="font-semibold text-sm text-zinc-900 dark:text-white">{author}</span>
          <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />{getTimeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
      </div>
    </div>
  );
}

export default function PullRequestDetailPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [comment, setComment] = useState('');
  const [reviewAction, setReviewAction] = useState(null);
  const [activeTab, setActiveTab] = useState('conversation');
  const { data: pr, isLoading, isError, error } = useQuery({ queryKey: ['pull-request', id], queryFn: () => fetchPullRequest(id), enabled: Boolean(id) });
  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ['pull-request', id] });
    await queryClient.invalidateQueries({ queryKey: ['pull-requests'] });
  };
  const commentMutation = useMutation({ mutationFn: () => addPullRequestComment(id, comment.trim()), onSuccess: async () => { setComment(''); await invalidate(); } });
  const reviewMutation = useMutation({ mutationFn: (action) => submitPullRequestReview(id, action), onSuccess: invalidate });

  if (isLoading) return <div className="min-h-screen grid place-items-center bg-white dark:bg-[#06070a]"><Spinner /></div>;
  if (isError || !pr) return <div className="min-h-screen bg-white dark:bg-[#06070a] p-6"><div className="max-w-3xl mx-auto"><ErrorState message={error?.message || 'Could not load pull request.'} /></div></div>;

  const author = getApiUserName(pr.author);
  const comments = Array.isArray(pr.comments) ? pr.comments : [];
  const config = statusConfig[pr.status] || statusConfig.open;

  return (
    <div className="min-h-screen bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10 pointer-events-none"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full" /></div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
          <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link><span>/</span>
          <Link to="/pull-requests" className="hover:text-emerald-400 transition-colors">Pull Requests</Link><span>/</span>
          <span className="text-zinc-900 dark:text-white font-medium">#{pr.number}</span>
        </div>
        <div className="mb-6">
          <div className="flex items-start gap-3 flex-wrap mb-3">
            <h1 className="text-2xl font-black tracking-tight flex-1">{pr.title}</h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.classes}`}>{config.icon}{config.label}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5"><User className="w-4 h-4" /><span className="font-medium text-zinc-700 dark:text-zinc-300">{author}</span>wants to merge</span>
            <span className="flex items-center gap-1.5"><GitBranch className="w-4 h-4" /><code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-xs font-mono">{pr.fromBranch || pr.sourceBranch}</code><span>to</span><code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 text-xs font-mono">{pr.toBranch || pr.targetBranch}</code></span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{getTimeAgo(pr.createdAt)}</span>
          </div>
        </div>
        <div className="flex border-b border-zinc-200 dark:border-white/10 mb-6">
          {[{ key: 'conversation', label: 'Conversation', icon: <MessageSquare className="w-4 h-4" /> }, { key: 'diff', label: 'Files Changed', icon: <GitBranch className="w-4 h-4" /> }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'}`}>{tab.icon}{tab.label}</button>
          ))}
        </div>
        {activeTab === 'conversation' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/10"><div className="w-7 h-7 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-400 font-bold text-xs">{getApiUserAvatar(pr.author)}</div><span className="font-semibold text-sm">{author}</span><span className="text-xs text-zinc-500">created {getTimeAgo(pr.createdAt)}</span></div>
              <div className="px-5 py-4 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{pr.description || 'No description provided.'}</div>
            </div>
            <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
              <div className="px-5 py-3 bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/10 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-zinc-400" /><span className="text-sm font-medium">{comments.length} Comments</span></div>
              <div className="divide-y divide-zinc-200 dark:divide-white/5 px-5">{comments.map((item) => <CommentItem key={item._id || item.id} comment={item} />)}</div>
              <div className="px-5 py-4 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.01]">
                <textarea rows={3} placeholder={user ? 'Leave a comment...' : 'Sign in to leave a comment'} value={comment} onChange={(event) => setComment(event.target.value)} disabled={!user || commentMutation.isPending} className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.03] text-sm text-zinc-900 dark:text-white placeholder-zinc-500 outline-none focus:border-emerald-400/50 resize-none transition-colors disabled:opacity-60" />
                <div className="flex justify-end mt-2"><button onClick={() => comment.trim() && commentMutation.mutate()} disabled={!user || !comment.trim() || commentMutation.isPending} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-400 text-black text-sm font-semibold hover:scale-[1.02] transition-all shadow-md shadow-emerald-500/20 disabled:opacity-40 disabled:pointer-events-none"><Send className="w-4 h-4" />Comment</button></div>
              </div>
            </div>
            {pr.status === 'open' && user && (
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 overflow-hidden">
                <div className="px-5 py-3 bg-zinc-50 dark:bg-white/[0.02] border-b border-zinc-200 dark:border-white/10"><span className="text-sm font-medium">Review Changes</span></div>
                <div className="px-5 py-4 flex flex-wrap gap-3">
                  <button onClick={() => { setReviewAction('approve'); reviewMutation.mutate('approve'); }} disabled={reviewMutation.isPending} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${reviewAction === 'approve' ? 'bg-emerald-400/20 border-emerald-400/40 text-emerald-400' : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-emerald-400/30 hover:text-emerald-400'}`}><CheckCircle className="w-4 h-4" />Approve</button>
                  <button onClick={() => { setReviewAction('changes_requested'); reviewMutation.mutate('changes_requested'); }} disabled={reviewMutation.isPending} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${reviewAction === 'changes_requested' ? 'bg-yellow-400/20 border-yellow-400/40 text-yellow-400' : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:border-yellow-400/30 hover:text-yellow-400'}`}><AlertCircle className="w-4 h-4" />Request Changes</button>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'diff' && <div><p className="text-sm text-zinc-500 mb-4">{(pr.diff || []).length} file{(pr.diff || []).length !== 1 ? 's' : ''} changed</p>{(pr.diff || []).map((file) => <DiffChunk key={file.file} file={file} />)}</div>}
      </div>
    </div>
  );
}
