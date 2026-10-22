import { View, Text, StyleSheet, Pressable } from 'react-native';
import { UserAvatar } from '@/components/media/UserAvatar';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { PostFollowButton } from './PostFollowButton';

interface PostAuthorHeaderProps {
  pseudo?: string | null;
  authorId?: string;
  avatarUrl?: string;
  onPress?: () => void;
  showFollowButton?: boolean;
}

export function PostAuthorHeader({
  pseudo,
  authorId,
  avatarUrl,
  onPress,
  showFollowButton = false,
}: PostAuthorHeaderProps) {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.authorInfo}
        onPress={onPress}
        disabled={onPress == null}
        accessibilityRole="button"
        accessibilityLabel={`Profil de ${pseudo ?? 'Auteur inconnu'}`}
      >
        <UserAvatar uri={avatarUrl} size={32} style={styles.avatarSpacing} />
        <Text style={styles.authorName} numberOfLines={1}>
          {pseudo ?? 'Auteur inconnu'}
        </Text>
      </Pressable>

      {showFollowButton && typeof authorId === 'string' && authorId.length > 0 ? (
        <PostFollowButton authorId={authorId} />
      ) : null}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.lightGrey,
      gap: theme.spacing.sm,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flexShrink: 1,
    },
    avatarSpacing: {
      marginRight: theme.spacing.md,
    },
    authorName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.secondary,
      flexShrink: 1,
    },
  });
