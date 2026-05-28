import { FolderOpen } from 'lucide-react';

const EmptyRepository = ({ 
  title = 'No repositories yet',
  message = 'Create your first repository to get started. You can create a new repository or fork an existing one.',
  showCreateButton = true,
  onCreateClick = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 px-4 py-12 text-center">
      <div className="mb-6 p-4 rounded-full bg-slate-100 dark:bg-slate-800">
        <FolderOpen className="w-12 h-12 text-slate-400 dark:text-slate-500" />
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
          Create Repository
        </button>
      )}
    </div>
  );
};

export default EmptyRepository;
