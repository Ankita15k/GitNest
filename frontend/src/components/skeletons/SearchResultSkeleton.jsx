const SearchResultSkeleton = () => {
  return (
    <div className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg animate-pulse">
      <div className="h-5 w-48 bg-zinc-300 dark:bg-zinc-700 rounded mb-3"></div>

      <div className="h-4 w-full bg-zinc-300 dark:bg-zinc-700 rounded mb-2"></div>

      <div className="h-4 w-3/4 bg-zinc-300 dark:bg-zinc-700 rounded mb-3"></div>

      <div className="flex gap-2">
        <div className="h-4 w-16 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
        <div className="h-4 w-16 bg-zinc-300 dark:bg-zinc-700 rounded"></div>
      </div>
    </div>
  );
};

export default SearchResultSkeleton;