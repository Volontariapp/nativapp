import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useGetIsFollowing } from './use-get-is-following';
import { useGetFollows } from './use-get-follows';
import { useGetFollowers } from './use-get-followers';
import { useUserSocialActions } from './use-user-social-actions';

interface UseOptimisticFollowReturn {
  isFollowing: boolean;
  localFollowersCount: number;
  followsCount: number;
  isMyFollowsLoading: boolean;
  isFollowActionPending: boolean;
  handleFollowPress: () => void;
}

export function useOptimisticFollow(
  userId: string,
  currentUserId?: string | null,
): UseOptimisticFollowReturn {
  const isOwnProfile = currentUserId === userId;
  const { data: isFollowingData, isLoading: isMyFollowsLoading } = useGetIsFollowing(
    userId,
    !isOwnProfile,
  );
  const { data: followsData } = useGetFollows(userId, { page: 1, limit: 1 });
  const { data: followersData } = useGetFollowers(userId, { page: 1, limit: 1 });
  const { follow, unfollow, isFollowingPending, isUnfollowingPending } = useUserSocialActions();

  const [followOverride, setFollowOverride] = useState<boolean | null>(null);
  const serverIsFollowing = isFollowingData?.isFollowing ?? false;
  const isFollowing = followOverride ?? serverIsFollowing;
  const isFollowActionPending = isFollowingPending || isUnfollowingPending;

  const [localFollowersCount, setLocalFollowersCount] = useState<number>(0);

  useEffect(() => {
    if (followersData?.pagination?.total !== undefined) {
      setLocalFollowersCount(followersData.pagination.total);
    }
  }, [followersData?.pagination?.total]);

  useEffect(() => {
    if (followOverride !== null && serverIsFollowing === followOverride) {
      setFollowOverride(null);
    }
  }, [serverIsFollowing, followOverride]);

  const handleFollowPress = () => {
    const nextIsFollowing = !isFollowing;
    setFollowOverride(nextIsFollowing);

    setLocalFollowersCount((prev) => (nextIsFollowing ? prev + 1 : Math.max(0, prev - 1)));

    const mutate = nextIsFollowing ? follow : unfollow;
    void mutate(userId).catch(() => {
      setFollowOverride(!nextIsFollowing);
      setLocalFollowersCount((prev) => (!nextIsFollowing ? prev + 1 : Math.max(0, prev - 1)));
      Alert.alert('Erreur', "Cette action n'a pas pu être effectuée. Réessaie plus tard.");
    });
  };

  return {
    isFollowing,
    localFollowersCount,
    followsCount: followsData?.pagination?.total ?? 0,
    isMyFollowsLoading,
    isFollowActionPending,
    handleFollowPress,
  };
}
