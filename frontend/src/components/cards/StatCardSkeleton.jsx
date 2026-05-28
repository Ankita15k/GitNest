const StatCardSkeleton = ({ variant = 'default', className = '' }) => {
  const variantBg = {
    default: 'bg-slate-50 dark:bg-slate-800/50',
    primary: 'bg-blue-50 dark:bg-blue-900/20',
    success: 'bg-green-50 dark:bg-green-900/20',
    warning: 'bg-amber-50 dark:bg-amber-900/20',
    danger: 'bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border border-slate-200 dark:border-slate-700 ${variantBg[variant]} animate-pulse ${className}`}
    >
      {/* Icon skeleton */}
      <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-600 flex-shrink-0" />
      
      <div className="flex-1">
        {/* Label skeleton */}
        <div className="h-4 bg-slate-200 dark:bg-slate-600 rounded w-20 mb-2" />
        
        {/* Value skeleton */}
        <div className="h-6 bg-slate-200 dark:bg-slate-600 rounded w-12" />
      </div>
    </div>
  );
};

export default StatCardSkeleton;
