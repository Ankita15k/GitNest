import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, LinkIcon, Calendar, Users, BookOpen } from 'lucide-react';
import { fetchUserProfile } from '../api/userApi';
import { useAuthStore } from '../store/authStore';
import { ProfileSkeleton } from '../components/ui/Skeleton';
import FollowButton from '../components/profile/FollowButton';
import EditProfileButton from '../components/profile/EditProfileButton';
import ErrorState from '../components/ui/ErrorState.jsx';
import SectionErrorBoundary from '../components/ui/SectionErrorBoundary.jsx';
import PageShell from '../components/layout/PageShell.jsx';
import { useApiRetry } from '../hooks/useApiRetry.js';

const UserProfileContent = ({ username }) => {
  const { user: authUser, isAuthenticated } = useAuthStore();

  const {
    data: profile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['profile', username],
    queryFn: () => fetchUserProfile(username),
  });

  const { retry, isRetrying, isRetryable } = useApiRetry(refetch, error);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (isError) {
    const isNotFound = error?.status === 404 || error?.code === 'NOT_FOUND';

    return (
      <ErrorState
        title={isNotFound ? 'User not found' : 'Unable to load profile'}
        message={
          isNotFound
            ? `We could not find a user named "${username}".`
            : error?.message || 'Something went wrong while loading this profile.'
        }
        onRetry={!isNotFound && isRetryable ? retry : undefined}
        isRetrying={isRetrying}
        variant={isNotFound ? 'warning' : 'danger'}
      >
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-emerald-500 hover:underline"
        >
          Go home
        </Link>
      </ErrorState>
    );
  }

  const isOwnProfile = isAuthenticated && authUser?.username === profile.username;
  const isFollowing = isAuthenticated && profile.followers?.some(
    (id) => id === authUser?._id || id?._id === authUser?._id
  );

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="shrink-0">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 dark:bg-emerald-500/10 flex items-center justify-center ring-2 ring-zinc-200 dark:ring-zinc-700">
              <span className="text-3xl font-bold text-emerald-500">
                {profile.username[0].toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{profile.username}</h1>
          {profile.bio && (
            <p className="mt-1 text-zinc-600 dark:text-zinc-400 text-sm">{profile.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-500 dark:text-zinc-400">
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-emerald-500 hover:underline"
              >
                <LinkIcon className="w-3.5 h-3.5" />
                {profile.website}
              </a>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {joinedDate}
            </span>
          </div>

          <div className="mt-3 flex gap-4 text-sm">
            <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
              <Users className="w-3.5 h-3.5" />
              <strong className="text-zinc-900 dark:text-white">
                {profile.followers?.length ?? 0}
              </strong>
              &nbsp;followers
            </span>
            <span className="text-zinc-600 dark:text-zinc-400">
              <strong className="text-zinc-900 dark:text-white">
                {profile.following?.length ?? 0}
              </strong>
              &nbsp;following
            </span>
          </div>

          <div className="mt-4">
            {isOwnProfile ? (
              <EditProfileButton />
            ) : isAuthenticated ? (
              <FollowButton username={profile.username} isFollowing={isFollowing} />
            ) : null}
          </div>
        </div>
      </div>

      <SectionErrorBoundary title="Repositories unavailable">
        <div className="mt-10">
          <h2 className="flex items-center gap-2 text-base font-semibold mb-4">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            Repositories
          </h2>

          {(!profile.repositories || profile.repositories.length === 0) ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              No public repositories yet.
            </p>
          ) : (
            <div className="grid gap-3">
              {profile.repositories.map((repo) => (
                <div
                  key={repo._id}
                  className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer">
                      {repo.name}
                    </h3>
                    {repo.stars > 0 && (
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-0.5 shrink-0">
                        ★ {repo.stars}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-zinc-400 dark:text-zinc-500">
                    {repo.language && <span>{repo.language}</span>}
                    {repo.updatedAt && (
                      <span>
                        Updated {new Date(repo.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="mt-3">
                    <Link
                      to={`/${username}/${repo.name}/architecture`}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 hover:border-emerald-500/40 hover:bg-emerald-500/15 dark:text-emerald-400"
                    >
                      View Architecture
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionErrorBoundary>
    </>
  );
};

const UserProfile = () => {
  const { username } = useParams();

  return (
    <PageShell>
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Profile</p>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">@{username}</h1>
          </div>
          <Link
            to="/"
            className="text-sm text-emerald-500 hover:underline shrink-0"
          >
            Home
          </Link>
        </div>

        <SectionErrorBoundary title="Profile content unavailable">
          <UserProfileContent username={username} />
        </SectionErrorBoundary>
      </div>
    </PageShell>
  );
};

export default UserProfile;
