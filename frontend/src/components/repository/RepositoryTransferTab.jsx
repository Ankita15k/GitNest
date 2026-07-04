import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { initiateTransfer } from '../../api/repositoryTransferApi';
import ErrorState from '../ui/ErrorState';

export default function RepositoryTransferTab({ username, reponame }) {
  const queryClient = useQueryClient();
  const [receiverUsername, setReceiverUsername] = useState('');
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const initiateMutation = useMutation({
    mutationFn: (data) => initiateTransfer({ owner: username, repoName: reponame, receiverUsername: data }),
    onSuccess: () => {
      setLocalError('');
      setSuccessMsg(`Transfer request sent to ${receiverUsername}. They must accept it to complete the transfer.`);
      setReceiverUsername('');
      queryClient.invalidateQueries({ queryKey: ['pending-transfers'] });
    },
    onError: (error) => {
      setSuccessMsg('');
      setLocalError(error?.response?.data?.message || error?.message || 'Unable to initiate transfer.');
    },
  });

  const handleTransfer = (e) => {
    e.preventDefault();
    if (!receiverUsername.trim()) return;
    initiateMutation.mutate(receiverUsername.trim());
  };

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 p-6">
        <div className="mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Transfer Ownership</h2>
        </div>
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
          Transfer this repository to another user. They will receive a request and must accept it to complete the transfer.
        </p>

        {localError && <div className="mb-4"><ErrorState message={localError} /></div>}
        {successMsg && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleTransfer} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Receiver username"
            value={receiverUsername}
            onChange={(e) => setReceiverUsername(e.target.value)}
            disabled={initiateMutation.isPending}
            className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-60 dark:border-white/10 dark:bg-zinc-900 dark:text-white"
          />
          <button
            type="submit"
            disabled={initiateMutation.isPending || !receiverUsername.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60"
          >
            {initiateMutation.isPending ? 'Initiating...' : 'Transfer Repository'}
          </button>
        </form>
      </section>
    </div>
  );
}
