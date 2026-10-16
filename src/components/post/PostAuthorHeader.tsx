import { Text, StyleSheet, Pressable } from 'react-native';
import { UserAvatar } from '@/components/media/UserAvatar';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface PostAuthorHeaderProps {
  pseudo?: string | null;
  authorId?: string;
  avatarUrl?: string;
  onPress?: () => void;
}

export function PostAuthorHeader({ pseudo, avatarUrl, onPress }: PostAuthorHeaderProps) {
  const styles = useStyles(createStyles);

  return (
    <Pressable style={styles.container} onPress={onPress} disabled={onPress == null}>
      <UserAvatar uri={avatarUrl} size={32} style={styles.avatarSpacing} />
      <Text style={styles.authorName}>{pseudo ?? 'Auteur inconnu'}</Text>
    </Pressable>
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
    },
    avatarSpacing: {
      marginRight: theme.spacing.md,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.primaryEco,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    avatarText: {
      color: theme.colors.white,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.bold,
      fontFamily: theme.typography.fonts.primary,
    },
    authorName: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      fontFamily: theme.typography.fonts.secondary,
    },
  });
