import { Link, useNavigate } from 'react-router-dom';
import { Star, GitFork, Trash2 } from 'lucide-react';
import { useFavoritesStore } from '../store/useFavoritesStore';

function FavoriteRepoCard({ repo, navigate, onRemove }) {
  return (
    <div
      onClick={() => navigate(`/repositories/${repo.owner?.username}/${repo.name}`)}
      className="p-4 border border-zinc-200 dark:border-white/10 rounded-xl hover:bg-zinc-50 dark:hover:bg-white/5 cursor-pointer transition-colors"
    >
      <div className="flex justify-between items-start">
        <p className="font-semibold text-zinc-900 dark:text-white truncate">
          {repo.owner?.username}/{repo.name}
        </p>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(repo);
          }}
          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-colors"
          title="Remove from favorites"
        >
          <Trash2 className="w-4 h-4" />
        </button>
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

        {repo.starsCount > 0 && (
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {repo.starsCount}
          </span>
        )}

        {repo.forksCount > 0 && (
          <span className="flex items-center gap-1">
            <GitFork className="w-3 h-3" />
            {repo.forksCount}
          </span>
        )}
      </div>
    </div>
  );
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const favorites = useFavoritesStore((state) => state.favorites);
  const removeFavorite = useFavoritesStore((state) => state.removeFavorite);
  const clearFavorites = useFavoritesStore((state) => state.clearFavorites);

  return (
    <div className="min-h-screen bg-white dark:bg-[#06070a] text-zinc-900 dark:text-white transition-colors">
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[100px] rounded-full" />
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-3">
            <Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-medium">Favorites</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
              Favorite Repositories
            </h1>
            {favorites.length > 0 && (
              <button
                onClick={clearFavorites}
                className="text-sm text-zinc-500 hover:text-red-500 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
          <p className="text-zinc-500 mt-2 text-sm">
            Repositories you've bookmarked for quick access. Saved right here in your browser.
          </p>
        </div>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((repo) => (
              <FavoriteRepoCard
                key={`${repo.owner?.username}/${repo.name}`}
                repo={repo}
                navigate={navigate}
                onRemove={removeFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-96 px-4 py-12 text-center rounded-2xl border border-zinc-200 dark:border-white/10">
            <div className="mb-6 p-4 rounded-full bg-zinc-100 dark:bg-zinc-800">
              <Star className="w-12 h-12 text-zinc-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-6">
              Bookmark repositories by clicking the star icon on any repository to see them here.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Browse Repositories
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}



