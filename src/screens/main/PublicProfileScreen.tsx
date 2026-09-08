import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import {
  AppText,
  AppHeader,
  AppLoader,
  ProfileLayout,
  ProfileSection,
  AppButton,
  EventCard,
} from '@/components';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useAuth } from '@/context/AuthContext';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import { useGetEvents } from '@/api/event/hooks/use-get-events';
import { useGetIsFollowing } from '@/api/social/hooks/use-get-is-following';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { EventState } from '@volontariapp/contracts';

const PUBLIC_EVENT_STATUSES = [
  EventState.EVENT_STATE_PUBLISHED,
  EventState.EVENT_STATE_IN_PROGRESS,
];

export function PublicProfileScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { params } = useRoute<RouteProp<MainStackParamList, 'PublicProfile'>>();
  const { userId: currentUserId } = useAuth();

  const { data: user, isLoading, error } = useGetPublicUser(params.userId);
  const {
    data: userEventsData,
    isLoading: isUserEventsLoading,
    hasNextPage: hasNextUserEvents,
    fetchNextPage: fetchNextUserEvents,
    isFetchingNextPage: isFetchingNextUserEvents,
  } = useGetEvents({
    organizerId: params.userId,
    statuses: PUBLIC_EVENT_STATUSES,
    limit: 2,
  });

  const isOwnProfile = currentUserId === params.userId;
  const { data: isFollowingData, isLoading: isMyFollowsLoading } = useGetIsFollowing(
    params.userId,
    !isOwnProfile,
  );
  const { follow, unfollow, isFollowingPending, isUnfollowingPending } = useUserSocialActions();

  // Override optimiste : posé au clic pour un retour instantané, et jamais réconcilié
  // avec le refetch de useGetMyFollows (trop lent pour ça, cf. commentaire plus haut).
  // Réinitialisé uniquement si l'action échoue (rollback).
  const [followOverride, setFollowOverride] = useState<boolean | null>(null);
  const isFollowing = followOverride ?? isFollowingData?.isFollowing ?? false;
  const isFollowActionPending = isFollowingPending || isUnfollowingPending;

  const handleFollowPress = () => {
    const nextIsFollowing = !isFollowing;
    setFollowOverride(nextIsFollowing);
    const mutate = nextIsFollowing ? follow : unfollow;
    void mutate(params.userId).catch(() => {
      setFollowOverride(!nextIsFollowing);
      Alert.alert('Erreur', "Cette action n'a pas pu être effectuée. Réessaie plus tard.");
    });
  };

  const isPageLoading = isLoading;

  const allUserEvents = userEventsData?.pages.flatMap((page) => page.events) ?? [];

  return (
    <View style={styles.container}>
      <AppHeader showBack />

      {isPageLoading ? (
        <AppLoader fullScreen={false} message="Chargement du profil..." />
      ) : error !== null || !user ? (
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            {error instanceof Error ? error.message : 'Impossible de charger ce profil.'}
          </AppText>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <ProfileLayout
            pseudo={user.pseudo}
            avatarUrl={user.logoPath}
            bio={user.bio}
            badges={user.badges}
            stats={[
              { label: 'Impact', value: user.totalImpactScore, color: theme.colors.primaryEco },
              { label: 'Badges', value: user.badges.length, color: theme.colors.secondarySocio },
              // TODO: brancher sur un futur endpoint public de comptage des follows/followers
              // par userId (aujourd'hui seuls /social/follows et /social/followers "self"
              // existent ; la variante par :userId est réservée aux admins).
              { label: 'Abonnés', value: 0, color: theme.colors.primarySocio },
              { label: 'Abonnements', value: 0, color: theme.colors.warning },
            ]}
            headerAction={
              isOwnProfile ? null : (
                <View style={styles.followButtonContainer}>
                  <AppButton
                    variant={isFollowing ? 'danger' : 'eco'}
                    size="small"
                    icon={isFollowing ? 'user-minus' : 'user-plus'}
                    text={isMyFollowsLoading ? '...' : isFollowing ? 'Ne plus suivre' : 'Suivre'}
                    disabled={isMyFollowsLoading || isFollowActionPending}
                    onPress={handleFollowPress}
                  />
                </View>
              )
            }
          >
            <ProfileSection title="Événements créés">
              {isUserEventsLoading ? (
                <ActivityIndicator color={theme.colors.primaryEco} />
              ) : allUserEvents.length > 0 ? (
                <View>
                  {allUserEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                  {hasNextUserEvents && (
                    <View style={styles.seeMoreContainer}>
                      <AppButton
                        variant="eco"
                        size="small"
                        text={isFetchingNextUserEvents ? 'Chargement...' : 'Voir plus'}
                        onPress={() => {
                          void fetchNextUserEvents();
                        }}
                        disabled={isFetchingNextUserEvents}
                      />
                    </View>
                  )}
                </View>
              ) : (
                <AppText style={styles.emptyText}>Aucun événement créé pour le moment.</AppText>
              )}
            </ProfileSection>
          </ProfileLayout>
        </ScrollView>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.xxl * 2,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.xl,
    },
    followButtonContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      marginTop: -theme.spacing.sm,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 16,
      textAlign: 'center',
    },
    emptyText: {
      color: theme.colors.grey,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    seeMoreContainer: {
      alignItems: 'center',
      marginTop: theme.spacing.sm,
    },
  });
