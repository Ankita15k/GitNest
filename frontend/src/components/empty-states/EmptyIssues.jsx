import { AlertCircle } from 'lucide-react';

const EmptyIssues = ({
  title = 'No issues found',
  message = 'There are no open issues in this repository. Create one to track bugs, feature requests, or tasks.',
  showCreateButton = true,
  onCreateClick = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-4 py-12 text-center">
      <div className="mb-6 p-4 rounded-full bg-amber-100 dark:bg-amber-900/30">
        <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
        {title}
      </h3>
      
      <p className="text-slate-600 dark:text-slate-400 max-w-md mb-6">
        {message}
      </p>
      
      {showCreateButton && onCreateClick && (
        <button
          onClick={onCreateClick}
          className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          Create Issue
        </button>
      )}
    </div>
  );
};

export default EmptyIssues;
