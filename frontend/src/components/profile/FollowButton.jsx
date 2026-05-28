import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { followUser, unfollowUser } from '../../api/userApi';
import { useToastStore } from '../../store/useToastStore';
import Spinner from '../ui/Spinner';

const FollowButton = ({ username, isFollowing }) => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);
  const [following, setFollowing] = useState(isFollowing);

  const { mutate, isPending } = useMutation({
    mutationFn: following ? () => unfollowUser(username) : () => followUser(username),
    onMutate: () => setFollowing((prev) => !prev),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', username] });
      addToast({
        message: following ? `Unfollowed ${username}` : `Following ${username}`,
        type: 'success',
      });
    },
    onError: (err) => {
      setFollowing((prev) => !prev);
      addToast({ message: err?.message || 'Something went wrong', type: 'error' });
    },
  });

  return (
    <button
      onClick={() => mutate()}
      disabled={isPending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60
        ${following
          ? 'border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-red-400 hover:text-red-500 dark:hover:text-red-400'
          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
        }`}
    >
      {isPending && <Spinner size="sm" />}
      {following ? 'Unfollow' : 'Follow'}
    </button>
  );
};

export default FollowButton;
