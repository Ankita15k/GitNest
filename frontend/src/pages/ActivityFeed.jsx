import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchGlobalActivities } from '../api/activityApi.js';
import ActivityFeed from '../components/activity/ActivityFeed.jsx';
import ActivitySkeleton from '../components/activity/ActivitySkeleton.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import SectionErrorBoundary from '../components/ui/SectionErrorBoundary.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import { useApiRetry } from '../hooks/useApiRetry.js';

const ActivityFeedSection = ({ page, limit, setPage }) => {
  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['activities', 'global', page, limit],
    queryFn: () => fetchGlobalActivities(page, limit),
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 30,
  });

  const { retry, isRetrying, isRetryable } = useApiRetry(refetch, error);

  const activities = data?.activities ?? [];
  const pagination = data?.pagination;

  if (isLoading) {
    return <ActivitySkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        title="Unable to load activity feed"
        message={error?.message || 'Something went wrong while loading activities.'}
        onRetry={isRetryable ? retry : undefined}
        isRetrying={isRetrying}
        variant="danger"
      />
    );
  }

  return (
    <>
      <SectionErrorBoundary title="Activity list unavailable">
        <ActivityFeed activities={activities} />
      </SectionErrorBoundary>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Showing page {pagination?.page ?? 1} of {pagination?.totalPages ?? 1}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={pagination?.page >= pagination?.totalPages}
            onClick={() => setPage((current) => current + 1)}
            className="rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
          >
            Next
          </button>
        </div>
      </div>
      {isFetching && !isLoading ? (
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">Refreshing feed...</p>
      ) : null}
    </>
  );
};

const ActivityFeedPage = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  return (
    <PageShell>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Activity Feed</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            A centralized feed of repository and profile activity, sorted newest first.
          </p>
        </div>

        <SectionErrorBoundary title="Activity feed unavailable">
          <ActivityFeedSection page={page} limit={limit} setPage={setPage} />
        </SectionErrorBoundary>
      </main>
    </PageShell>
  );
};

export default ActivityFeedPage;
