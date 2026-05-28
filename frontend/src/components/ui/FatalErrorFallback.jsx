const FatalErrorFallback = ({ error, onReload }) => {
  const requestId = error?.requestId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#06070a] px-4">
      <div className="max-w-lg w-full rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Something unexpected happened
        </h1>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          GitNest hit an unrecoverable error while rendering this page. Reload to continue.
        </p>
        {import.meta.env.DEV && requestId ? (
          <p className="mt-4 text-xs font-mono text-zinc-500 dark:text-zinc-500">
            Request ID: {requestId}
          </p>
        ) : null}
        {import.meta.env.DEV && error?.message ? (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400 break-words">
            {error.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onReload}
          className="mt-6 inline-flex rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-600"
        >
          Reload page
        </button>
      </div>
    </div>
  );
};

export default FatalErrorFallback;
