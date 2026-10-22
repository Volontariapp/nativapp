import React, { useContext, useState } from 'react';
import { Pressable, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AuthContext } from '@/context/AuthContext';
import { useGetIsFollowing } from '@/api/social/hooks/use-get-is-following';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';
import { DELETED_USER_ID } from '@/shared/lib/user.constants';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface PostFollowButtonProps {
  authorId: string;
}

export function PostFollowButton({ authorId }: PostFollowButtonProps): React.JSX.Element | null {
  const styles = useStyles(createStyles);
  const auth = useContext(AuthContext);
  const currentUserId = auth?.userId;

  const hasUserId = typeof currentUserId === 'string' && currentUserId.length > 0;
  const isSelf = hasUserId && currentUserId === authorId;
  const isDeleted = authorId === DELETED_USER_ID;
  const isEnabled = hasUserId && !isSelf && !isDeleted;

  const { data: isFollowingData, isLoading: isQueryLoading } = useGetIsFollowing(
    authorId,
    isEnabled,
  );
  const { follow, unfollow, isFollowingPending, isUnfollowingPending } = useUserSocialActions();

  const [overrideState, setOverrideState] = useState<{
    value: boolean;
    serverWas: boolean;
  } | null>(null);

  if (!hasUserId || isSelf || isDeleted) {
    return null;
  }

  const serverIsFollowing = isFollowingData?.isFollowing ?? false;
  const isFollowing =
    overrideState?.serverWas === serverIsFollowing ? overrideState.value : serverIsFollowing;

  const isPending = isFollowingPending || isUnfollowingPending;

  const handlePress = async () => {
    if (isPending) return;
    const nextState = !isFollowing;
    setOverrideState({ value: nextState, serverWas: serverIsFollowing });

    try {
      if (nextState) {
        await follow(authorId);
      } else {
        await unfollow(authorId);
      }
    } catch {
      setOverrideState(null);
      Alert.alert('Erreur', "Cette action n'a pas pu être effectuée. Réessaie plus tard.");
    }
  };

  return (
    <Pressable
      testID="post-follow-button"
      accessibilityRole="button"
      accessibilityLabel={isFollowing ? 'Ne plus suivre' : 'Suivre'}
      style={({ pressed }) => [
        styles.button,
        isFollowing ? styles.buttonFollowing : styles.buttonNotFollowing,
        pressed && styles.buttonPressed,
      ]}
      onPress={() => {
        void handlePress();
      }}
      disabled={isPending}
    >
      {isPending || isQueryLoading ? (
        <ActivityIndicator
          size="small"
          color={isFollowing ? styles.textFollowing.color : styles.textNotFollowing.color}
          style={styles.spinner}
        />
      ) : (
        <Feather
          name={isFollowing ? 'check' : 'user-plus'}
          size={12}
          color={isFollowing ? styles.textFollowing.color : styles.textNotFollowing.color}
        />
      )}
      <Text style={[styles.text, isFollowing ? styles.textFollowing : styles.textNotFollowing]}>
        {isFollowing ? 'Suivi' : 'Suivre'}
      </Text>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: theme.radius.full,
      gap: 4,
    },
    buttonNotFollowing: {
      backgroundColor: theme.colors.primaryEco,
    },
    buttonFollowing: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
    },
    buttonPressed: {
      opacity: 0.7,
    },
    text: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      fontFamily: theme.typography.fonts.primary,
    },
    textNotFollowing: {
      color: theme.colors.white,
    },
    textFollowing: {
      color: theme.colors.text,
    },
    spinner: {
      marginRight: 2,
    },
  });
