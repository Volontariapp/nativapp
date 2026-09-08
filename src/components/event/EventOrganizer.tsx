import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Image } from 'expo-image';
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
            <Image
              source={{
                uri: user?.logoPath ?? `https://i.pravatar.cc/150?u=${organizerId}`,
              }}
              style={styles.avatar}
            />
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
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: theme.spacing.md,
      backgroundColor: theme.colors.lightGrey,
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
