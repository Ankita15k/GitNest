const UserCardSkeleton = ({ className = '' }) => {
  return (
    <div className={`rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden animate-pulse ${className}`}>
      {/* Header background skeleton */}
      <div className="h-24 bg-slate-200 dark:bg-slate-700" />

      <div className="px-6 pb-6">
        {/* Avatar & header skeleton */}
        <div className="flex items-start gap-4 -mt-12 mb-4">
          {/* Avatar skeleton */}
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-600 shrink-0" />
          
          <div className="flex-1 pt-4 w-full">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Full name skeleton */}
                <div className="h-5 bg-slate-200 dark:bg-slate-600 rounded w-40 mb-2" />
                {/* Username skeleton */}
                <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-28" />
              </div>
              {/* Menu button skeleton */}
              <div className="w-5 h-5 bg-slate-200 dark:bg-slate-600 rounded" />
            </div>
          </div>
        </div>

        {/* Bio skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-3/4" />
        </div>

        {/* Info skeleton */}
        <div className="flex flex-col gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-32" />
          ))}
        </div>

        {/* Stats skeleton */}
        <div className="flex gap-6 mb-4 py-3 border-t border-b border-slate-200 dark:border-slate-700">
          {[1, 2].map((i) => (
            <div key={i}>
              <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-12 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-600 rounded w-16" />
            </div>
          ))}
        </div>

        {/* Button skeleton */}
        <div className="w-full h-9 bg-slate-200 dark:bg-slate-600 rounded-lg" />
      </div>
    </div>
  );
};

export default UserCardSkeleton;
