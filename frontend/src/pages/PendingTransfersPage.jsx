import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingTransfers, acceptTransfer, rejectTransfer, cancelTransfer } from '../api/repositoryTransferApi';
import PageShell from '../components/layout/PageShell';
import ErrorState from '../components/ui/ErrorState';
import { Inbox, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function PendingTransfersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pending-transfers'],
    queryFn: getPendingTransfers,
  });

  const acceptMutation = useMutation({
    mutationFn: ({ owner, repoName }) => acceptTransfer({ owner, repoName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-transfers'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ owner, repoName }) => rejectTransfer({ owner, repoName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-transfers'] }),
  });

  const cancelMutation = useMutation({
    mutationFn: ({ owner, repoName }) => cancelTransfer({ owner, repoName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pending-transfers'] }),
  });

  if (isLoading) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-10">Loading transfers...</div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <div className="mx-auto max-w-4xl px-4 py-10">
          <ErrorState message={error.message || 'Failed to load pending transfers'} />
        </div>
      </PageShell>
    );
  }

  const { incoming = [], outgoing = [] } = data?.data || {};

  return (
    <PageShell>
      <div className="min-h-screen bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">Repository Transfers</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Manage your incoming and outgoing repository transfer requests.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Inbox className="h-5 w-5 text-emerald-500" />
              Incoming Requests
            </h2>
            {incoming.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6 text-sm text-zinc-500 dark:text-zinc-400">
                You have no incoming repository transfer requests.
              </div>
            ) : (
              <div className="grid gap-4">
                {incoming.map((transfer) => (
                  <div key={transfer._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-white/10 p-4">
                    <div>
                      <p className="font-medium">{transfer.sender?.username} wants to transfer <span className="font-bold">{transfer.repository?.name}</span> to you.</p>
                      <p className="text-xs text-zinc-500 mt-1">Requested {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptMutation.mutate({ owner: transfer.sender.username, repoName: transfer.repository.name })}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="rounded-lg bg-emerald-500 hover:bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => rejectMutation.mutate({ owner: transfer.sender.username, repoName: transfer.repository.name })}
                        disabled={acceptMutation.isPending || rejectMutation.isPending}
                        className="rounded-lg border border-zinc-300 dark:border-white/10 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              <Send className="h-5 w-5 text-blue-500" />
              Outgoing Requests
            </h2>
            {outgoing.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] p-6 text-sm text-zinc-500 dark:text-zinc-400">
                You have no pending outgoing transfers.
              </div>
            ) : (
              <div className="grid gap-4">
                {outgoing.map((transfer) => (
                  <div key={transfer._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-zinc-200 dark:border-white/10 p-4">
                    <div>
                      <p className="font-medium">You requested to transfer <span className="font-bold">{transfer.repository?.name}</span> to {transfer.receiver?.username}.</p>
                      <p className="text-xs text-zinc-500 mt-1">Sent {formatDistanceToNow(new Date(transfer.createdAt), { addSuffix: true })}</p>
                    </div>
                    <div>
                      <button
                        onClick={() => cancelMutation.mutate({ owner: transfer.sender.username, repoName: transfer.repository.name })}
                        disabled={cancelMutation.isPending}
                        className="rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        Cancel Transfer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
