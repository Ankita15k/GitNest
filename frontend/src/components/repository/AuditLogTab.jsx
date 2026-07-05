import { useState } from 'react';
import { useAuditLogs } from '../../hooks/useAuditLogs.js';

const ACTION_TYPES = [
  'repo.create',
  'repo.update',
  'repo.delete',
  'branch_protection.create',
  'branch_protection.update',
  'branch_protection.delete',
  'collaborator.add',
  'collaborator.remove',
  'collaborator.role_change',
  'auth.login',
  'auth.logout',
  'settings.update',
];

const initialFilters = {
  actionType: '',
  actorId: '',
  startDate: '',
  endDate: '',
};

const getRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds} secs ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return `${years} years ago`;
};

const formatTimestamp = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleString();
};

const initialState = {
  page: 1,
  filters: initialFilters,
  selectedLog: null,
};

export default function AuditLogTab({ username, reponame }) {
  const [state, setState] = useState(initialState);
  const { page, filters, selectedLog } = state;

  const queryFilters = {
    actionType: filters.actionType || undefined,
    actorId: filters.actorId.trim() || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };

  const { data, isLoading, isError } = useAuditLogs({
    username,
    reponame,
    page,
    filters: queryFilters,
  });

  const logs = data?.logs ?? [];
  const pagination = data?.pagination ?? { page, totalPages: 1 };
  const totalPages = pagination.totalPages ?? 1;

  const handleClearFilters = () => {
    setState((current) => ({ ...current, page: 1, filters: initialFilters }));
  };

  const updateFilter = (field, value) => {
    setState((current) => ({
      ...current,
      page: 1,
      filters: {
        ...current.filters,
        [field]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Action Type</span>
            <select
              value={filters.actionType}
              onChange={(event) => updateFilter('actionType', event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            >
              <option value="">All Actions</option>
              {ACTION_TYPES.map((actionType) => (
                <option key={actionType} value={actionType}>
                  {actionType}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Actor ID</span>
            <input
              type="text"
              value={filters.actorId}
              onChange={(event) => updateFilter('actorId', event.target.value)}
              placeholder="Filter by user ID"
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-emerald-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">Start Date</span>
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter('startDate', event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-zinc-600 dark:text-zinc-300">End Date</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter('endDate', event.target.value)}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-emerald-400 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
            />
          </label>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="h-10 rounded-xl border border-zinc-200 px-4 text-sm font-medium text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.05]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        {isLoading ? (
          <div className="flex items-center justify-center px-6 py-16 text-sm text-zinc-500 dark:text-zinc-400">
            Loading audit logs...
          </div>
        ) : isError ? (
          <div className="px-6 py-16 text-center text-sm text-red-500">Failed to load audit logs.</div>
        ) : logs.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-zinc-500 dark:text-zinc-400">No audit log entries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 dark:divide-white/10">
              <thead className="bg-zinc-50 dark:bg-white/[0.02]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Actor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Repository</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-white/10">
                {logs.map((log) => (
                  <tr
                    key={log._id}
                    onClick={() => setState((current) => ({ ...current, selectedLog: log }))}
                    className="cursor-pointer transition hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
                  >
                    <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">{log.actorId?.username || log.actorId || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-900 dark:text-zinc-100">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-xs text-zinc-700 dark:bg-white/10 dark:text-zinc-200">
                        {log.actionType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">{log.repositoryId?.name || reponame || 'Repository'}</td>
                    <td className="px-6 py-4 text-sm text-zinc-600 dark:text-zinc-400">{getRelativeTime(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-zinc-300 sm:flex-row sm:items-center sm:justify-between">
        <div>Page {pagination.page || page} of {totalPages}</div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setState((current) => ({ ...current, page: Math.max(1, current.page - 1) }))}
            disabled={page <= 1}
            className="rounded-xl border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-zinc-300"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setState((current) => ({ ...current, page: current.page + 1 }))}
            disabled={page >= totalPages}
            className="rounded-xl border border-zinc-200 px-4 py-2 font-medium text-zinc-700 transition disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:text-zinc-300"
          >
            Next
          </button>
        </div>
      </div>

      {selectedLog ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 py-6 sm:items-center">
          <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl dark:bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Audit Log Details</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Review the full event payload.</p>
              </div>
              <button
                type="button"
                onClick={() => setState((current) => ({ ...current, selectedLog: null }))}
                className="rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-white/[0.05]"
              >
                Close
              </button>
            </div>
            <div className="grid gap-4 px-6 py-5 sm:grid-cols-2">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Actor</div>
                <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{selectedLog.actorId?.username || selectedLog.actorId || 'Unknown'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Action</div>
                <div className="mt-1 font-mono text-sm text-zinc-900 dark:text-zinc-100">{selectedLog.actionType}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">IP Address</div>
                <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{selectedLog.ipAddress || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">Created At</div>
                <div className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">{formatTimestamp(selectedLog.createdAt)}</div>
              </div>
            </div>
            <div className="border-t border-zinc-200 px-6 py-5 dark:border-white/10">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-zinc-500">Metadata</div>
              <pre className="max-h-80 overflow-auto rounded-2xl bg-zinc-950 p-4 text-xs leading-6 text-zinc-100">
                {JSON.stringify(selectedLog.metadata ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}