import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getRepoKey = (repo) => `${repo?.owner?.username}/${repo?.name}`;

export const useFavoritesStore = create(
  persist(
    (set, get) => ({
      favorites: [],

      isFavorite: (repo) => {
        const key = getRepoKey(repo);
        return get().favorites.some((fav) => getRepoKey(fav) === key);
      },

      toggleFavorite: (repo) => {
        const key = getRepoKey(repo);
        set((state) => {
          const exists = state.favorites.some((fav) => getRepoKey(fav) === key);
          if (exists) {
            return { favorites: state.favorites.filter((fav) => getRepoKey(fav) !== key) };
          }
          return {
            favorites: [
              ...state.favorites,
              {
                _id: repo._id,
                name: repo.name,
                description: repo.description ?? '',
                language: repo.language ?? null,
                owner: repo.owner ? { username: repo.owner.username } : null,
                starsCount: Array.isArray(repo.stars) ? repo.stars.length : (repo.starsCount ?? 0),
                forksCount: Array.isArray(repo.forks) ? repo.forks.length : (repo.forksCount ?? 0),
                addedAt: new Date().toISOString(),
              },
            ],
          };
        });
      },

      removeFavorite: (repo) => {
        const key = getRepoKey(repo);
        set((state) => ({
          favorites: state.favorites.filter((fav) => getRepoKey(fav) !== key),
        }));
      },

      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'gitnest-favorites-storage',
    }
  )
);


