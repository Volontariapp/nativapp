import { useState } from 'react';
import { Alert } from 'react-native';
import { useGetIsFollowing } from './use-get-is-following';
import { useGetFollows } from './use-get-follows';
import { useGetFollowers } from './use-get-followers';
import { useUserSocialActions } from './use-user-social-actions';

/** Valeur affichée en attendant le serveur ; ignorée dès que le serveur change d'état. */
interface FollowOverride {
  value: boolean;
  serverWas: boolean;
}

interface UseOptimisticFollowReturn {
  isFollowing: boolean;
  localFollowersCount: number;
  followsCount: number;
  isMyFollowsLoading: boolean;
  isFollowActionPending: boolean;
  handleFollowPress: () => void;
}

interface Paginated {
  pagination?: { total?: number };
}

const totalOf = (data: Paginated | undefined): number => data?.pagination?.total ?? 0;

const resolveFollowState = (
  override: FollowOverride | null,
  serverIsFollowing: boolean,
): { isFollowing: boolean; followersDelta: number } => {
  if (override?.serverWas !== serverIsFollowing) {
    return { isFollowing: serverIsFollowing, followersDelta: 0 };
  }
  return {
    isFollowing: override.value,
    followersDelta: Number(override.value) - Number(serverIsFollowing),
  };
};

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

  const [followOverride, setFollowOverride] = useState<FollowOverride | null>(null);
  const serverIsFollowing = isFollowingData?.isFollowing ?? false;
  const { isFollowing, followersDelta } = resolveFollowState(followOverride, serverIsFollowing);
  const isFollowActionPending = isFollowingPending || isUnfollowingPending;
  const localFollowersCount = Math.max(0, totalOf(followersData) + followersDelta);

  const handleFollowPress = () => {
    const nextIsFollowing = !isFollowing;
    setFollowOverride({ value: nextIsFollowing, serverWas: serverIsFollowing });

    const mutate = nextIsFollowing ? follow : unfollow;
    void mutate(userId).catch(() => {
      setFollowOverride(null);
      Alert.alert('Erreur', "Cette action n'a pas pu être effectuée. Réessaie plus tard.");
    });
  };

  return {
    isFollowing,
    localFollowersCount,
    followsCount: totalOf(followsData),
    isMyFollowsLoading,
    isFollowActionPending,
    handleFollowPress,
  };
}
