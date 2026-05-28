import { Star, GitFork, Eye, Code2 } from 'lucide-react';

const StatCard = ({
  icon: Icon,
  label,
  value,
  variant = 'default',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700',
    primary: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    danger: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  };

  const iconColorStyles = {
    default: 'text-slate-600 dark:text-slate-400',
    primary: 'text-blue-600 dark:text-blue-400',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  const bgStyle = variantStyles[variant] || variantStyles.default;
  const iconColor = iconColorStyles[variant] || iconColorStyles.default;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all hover:shadow-md ${bgStyle} ${className}`}
    >
      {Icon && (
        <div className={`flex-shrink-0 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value}
        </p>
      </div>
    </div>
  );
};

/**
 * Preset stat cards for common repository statistics
 */
export const RepoStars = ({ count = 0 }) => (
  <StatCard icon={Star} label="Stars" value={count} variant="primary" />
);

export const RepoForks = ({ count = 0 }) => (
  <StatCard icon={GitFork} label="Forks" value={count} variant="success" />
);

export const RepoWatchers = ({ count = 0 }) => (
  <StatCard icon={Eye} label="Watchers" value={count} variant="warning" />
);

export const RepoLanguage = ({ language = 'Unknown' }) => (
  <StatCard icon={Code2} label="Language" value={language} variant="danger" />
);

export default StatCard;
