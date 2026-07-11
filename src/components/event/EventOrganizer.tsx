import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';

interface EventOrganizerProps {
  organizerId?: string;
}

export function EventOrganizer({ organizerId }: EventOrganizerProps) {
  const { data: user, isLoading } = useGetPublicUser(organizerId);

  if (organizerId == null) return null;

  return (
    <View style={styles.container}>
      <AppText style={styles.label}>Organisé par</AppText>
      <View style={styles.profileContainer}>
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
              <AppText style={styles.name}>{user?.pseudo != null || 'Utilisateur inconnu'}</AppText>
              {user?.totalImpactScore !== undefined && (
                <AppText style={styles.score}>{user.totalImpactScore} pts d'impact</AppText>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: theme.colors.black,
  },
  score: {
    fontSize: 12,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
    marginTop: 2,
  },
});
