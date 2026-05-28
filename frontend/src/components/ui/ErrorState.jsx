import Spinner from './Spinner.jsx';

const variantStyles = {
  default: 'border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950',
  danger: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40',
};

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We could not load this section. Please try again.',
  onRetry,
  isRetrying = false,
  retryLabel = 'Try again',
  variant = 'default',
  className = '',
  children,
}) => {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={`rounded-3xl border p-6 shadow-sm ${styles} ${className}`}
      role="alert"
    >
      <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{message}</p>
      {children}
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={isRetrying}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600"
        >
          {isRetrying ? <Spinner size="sm" /> : null}
          {isRetrying ? 'Retrying...' : retryLabel}
        </button>
      ) : null}
    </div>
  );
};

export default ErrorState;
