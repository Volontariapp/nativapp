import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { PostWeb } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import AppPost from '@/components/post/AppPost';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { ProfileSection } from './ProfileSection';

interface ProfilePostsProps {
  posts: PostWeb[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}

/** Posts d'un utilisateur sur son profil, avec la même carte que le fil d'actualité. */
export function ProfilePosts({
  posts,
  isLoading,
  hasNextPage,
  fetchNextPage,
  isFetchingNextPage,
}: ProfilePostsProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <ProfileSection title="Posts">
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primaryEco} />
      ) : posts.length > 0 ? (
        <View>
          {posts.map((post) => (
            <AppPost key={post.id} post={post} />
          ))}
          {hasNextPage && (
            <View style={styles.seeMoreContainer}>
              <AppButton
                variant="eco"
                size="small"
                text={isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
                onPress={fetchNextPage}
                disabled={isFetchingNextPage}
              />
            </View>
          )}
        </View>
      ) : (
        <AppText style={styles.emptyText}>Aucun post pour le moment.</AppText>
      )}
    </ProfileSection>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    seeMoreContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
    emptyText: {
      color: theme.colors.grey,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
  });
