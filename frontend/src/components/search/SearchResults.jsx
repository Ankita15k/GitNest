import { useNavigate } from 'react-router-dom';
import { Star, GitFork, User, Calendar, GitPullRequest, GitMerge, XCircle, Copy } from 'lucide-react';
import SearchResultSkeleton from '../skeletons/SearchResultSkeleton';
import { useFavoritesStore } from '../../store/useFavoritesStore';

const statusConfig = {
  open: { icon: <GitPullRequest className="w-3 h-3" />, label: 'Open', classes: 'bg-emerald-400/10 text-emerald-400' },
  merged: { icon: <GitMerge className="w-3 h-3" />, label: 'Merged', classes: 'bg-purple-400/10 text-purple-400' },
  closed: { icon: <XCircle className="w-3 h-3" />, label: 'Closed', classes: 'bg-red-400/10 text-red-400' },
};

const getTimeAgo = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const UserResult = ({ user, navigate }) => (
  <div
    onClick={() => navigate(`/profile/${user.username}`)}
    className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
  >
    <div className="flex items-start gap-3">
      {user.avatarUrl && (
        <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full" />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-zinc-900 dark:text-white truncate">{user.displayName || user.username}</p>
        <p className="text-sm text-zinc-500">@{user.username}</p>
        {user.bio && <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">{user.bio}</p>}
      </div>
    </div>
  </div>
);
const copyRepoUrl = async (e, repo) => {
  e.stopPropagation();

  const repoUrl = `${window.location.origin}/repositories/${repo.owner.username}/${repo.name}`;

  try {
    await navigator.clipboard.writeText(repoUrl);
    alert('Repository URL copied!');
  } catch (error) {
    console.error('Copy failed', error);
  }
};

const RepositoryResult = ({ repo, navigate }) => {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(repo));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    toggleFavorite(repo);
  };

  return (
  <div
    onClick={() => navigate(`/repositories/${repo.owner.username}/${repo.name}`)}
    className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
  >
    <div className="flex justify-between items-start">
      <p className="font-semibold text-zinc-900 dark:text-white truncate">
        {repo.owner.username}/{repo.name}
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={handleToggleFavorite}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <Star
            className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-500'}`}
          />
        </button>

        <button
          onClick={(e) => copyRepoUrl(e, repo)}
          className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700"
          title="Copy Repository URL"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>
    </div>

    {repo.description && (
      <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
        {repo.description}
      </p>
    )}

    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
      {repo.language && (
        <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded">
          {repo.language}
        </span>
      )}

      {repo.stars && repo.stars.length > 0 && (
        <span className="flex items-center gap-1">
          <Star className="w-3 h-3" />
          {repo.stars.length}
        </span>
      )}

      {repo.forks && repo.forks.length > 0 && (
        <span className="flex items-center gap-1">
          <GitFork className="w-3 h-3" />
          {repo.forks.length}
        </span>
      )}
    </div>
  </div>
  );
};

const PullRequestResult = ({ pr, navigate }) => {
  const config = statusConfig[pr.status] || statusConfig.open;
  return (
    <div
      onClick={() => navigate(`/pull-requests/${pr._id}`)}
      className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-zinc-900 dark:text-white truncate">{pr.title}</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-1 mt-1">{pr.description}</p>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${config.classes}`}>
          {config.icon}
          {config.label}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-500">
        {pr.author && (
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {pr.author.username}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {getTimeAgo(pr.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default function SearchResults({ results, isLoading }) {
  const navigate = useNavigate();

  if (isLoading) {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <SearchResultSkeleton key={i} />
      ))}
    </div>
  );
}

  if (!results || (Object.values(results.results).every(arr => arr.length === 0))) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No results found for "{results?.query}"</p>
      </div>
    );
  }

  const { results: groupedResults } = results;

  return (
    <div className="space-y-6">
      {groupedResults.users && groupedResults.users.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Users ({groupedResults.users.length})</h3>
          <div className="space-y-2">
            {groupedResults.users.map((user) => (
              <UserResult key={user._id} user={user} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {groupedResults.repositories && groupedResults.repositories.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Repositories ({groupedResults.repositories.length})</h3>
          <div className="space-y-2">
            {groupedResults.repositories.map((repo) => (
              <RepositoryResult key={repo._id} repo={repo} navigate={navigate} />
            ))}
          </div>
        </div>
      )}

      {groupedResults.pullRequests && groupedResults.pullRequests.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">Pull Requests ({groupedResults.pullRequests.length})</h3>
          <div className="space-y-2">
            {groupedResults.pullRequests.map((pr) => (
              <PullRequestResult key={pr._id} pr={pr} navigate={navigate} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



