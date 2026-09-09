import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { AppText, AppHeader, AppLoader, ProfileLayout, AppButton } from '@/components';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useAuth } from '@/context/AuthContext';
import { useGetPublicUser } from '@/api/user/hooks/use-get-public-user';
import { useGetEvents } from '@/api/event/hooks/use-get-events';
import { useOptimisticFollow } from '@/api/social/hooks/use-optimistic-follow';
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

  const {
    isFollowing,
    localFollowersCount,
    followsCount,
    isMyFollowsLoading,
    isFollowActionPending,
    handleFollowPress,
  } = useOptimisticFollow(params.userId, currentUserId);

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
              { label: 'Abonnés', value: localFollowersCount, color: theme.colors.primarySocio },
              {
                label: 'Abonnements',
                value: followsCount,
                color: theme.colors.warning,
              },
            ]}
            headerAction={
              currentUserId === params.userId ? null : (
                <View style={styles.followButtonContainer}>
                  <View style={styles.buttonWrapper}>
                    <AppButton
                      variant={isFollowing ? 'danger' : 'eco'}
                      size="small"
                      icon={isFollowing ? 'user-minus' : 'user-plus'}
                      text={isMyFollowsLoading ? '...' : isFollowing ? 'Ne plus suivre' : 'Suivre'}
                      disabled={isMyFollowsLoading || isFollowActionPending}
                      onPress={handleFollowPress}
                    />
                  </View>
                  <View style={styles.buttonWrapper}>
                    <AppButton
                      variant="secondary"
                      size="small"
                      icon="message-circle"
                      text="Message"
                      onPress={() => {
                        Alert.alert('Message', 'Bientôt disponible 💬');
                      }}
                    />
                  </View>
                </View>
              )
            }
            eventsTabs={{
              created: {
                events: allUserEvents,
                isLoading: isUserEventsLoading,
                hasNextPage: hasNextUserEvents,
                fetchNextPage: () => {
                  void fetchNextUserEvents();
                },
                isFetchingNextPage: isFetchingNextUserEvents,
              },
            }}
          />
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
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.lg,
      gap: theme.spacing.sm,
      width: '100%',
    },
    buttonWrapper: {
      flex: 1,
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
  });
