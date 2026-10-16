import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { UserAvatar } from '@/components/media/UserAvatar';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';

interface EventOrganizerProps {
  organizerId?: string;
}

export function EventOrganizer({ organizerId }: EventOrganizerProps) {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { data: user, isLoading } = useGetPublicUser(organizerId);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  if (organizerId == null) return null;

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>Organisé par</AppText>
      <Pressable
        style={styles.profileContainer}
        onPress={() => {
          navigation.navigate('PublicProfile', { userId: organizerId });
        }}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={theme.colors.primarySocio} />
        ) : (
          <>
            <UserAvatar uri={resolveAvatarUrl(user)} size={40} style={styles.avatarSpacing} />
            <View style={styles.info}>
              <AppText style={styles.name}>{user?.pseudo ?? 'Utilisateur inconnu'}</AppText>
              {user?.totalImpactScore !== undefined && (
                <AppText style={styles.score}>{user.totalImpactScore} pts d'impact</AppText>
              )}
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.white,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.lg,
      marginBottom: theme.spacing.lg,
      ...theme.shadows.card,
    },
    label: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.grey,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: theme.spacing.sm,
    },
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 40,
    },
    avatarSpacing: {
      marginRight: theme.spacing.md,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: 16,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    score: {
      fontSize: 12,
      color: theme.colors.success,
      fontWeight: theme.typography.fontWeight.medium,
      marginTop: 2,
    },
  });
