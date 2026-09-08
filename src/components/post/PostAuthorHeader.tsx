import { Text, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

interface PostAuthorHeaderProps {
  pseudo?: string | null;
  authorId?: string;
  onPress?: () => void;
}

export function PostAuthorHeader({ pseudo, authorId, onPress }: PostAuthorHeaderProps) {
  const styles = useStyles(createStyles);

  const seed = pseudo ?? authorId ?? 'default';
  const avatarUrl = `https://i.pravatar.cc/150?u=${seed}`;

  return (
    <Pressable style={styles.container} onPress={onPress} disabled={onPress == null}>
      <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
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
    avatarImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
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
