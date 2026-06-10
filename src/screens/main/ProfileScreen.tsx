import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import {
  AppButton,
  AppText,
  AppHeader,
  AppLoader,
  ComingSoonPlaceholder,
  ProfileHeader,
  ProfileSection,
  ProfileStats,
  ProfileBadges,
  ProfileBio,
  ProfileEditModal,
  AppIconsButton,
  AppCalendar,
  EventCard,
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/shared/themes/theme';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useUpdateProfile } from '@/api/user/hooks/use-update-profile';
import { useUserParticipations } from '@/api/social/hooks/use-user-participations';
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/stacks/ProfileStack';

const handleSettingsPress = () => {
  Alert.alert('Paramètres', 'Coming soon ⚙️');
};

export function ProfileScreen(): React.JSX.Element {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { logout } = useAuth();
  const { navigate } = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile();
  const { data: participations, isLoading: isParticipationsLoading } = useUserParticipations();
  const {
    data: myEventsData,
    isLoading: isMyEventsLoading,
    hasNextPage: hasNextMyEvents,
    fetchNextPage: fetchNextMyEvents,
    isFetchingNextPage: isFetchingNextMyEvents,
  } = useGetMyEvents(2);

  const {
    data: participatedEventsData,
    isLoading: isParticipatedEventsLoading,
    hasNextPage: hasNextParticipatedEvents,
    fetchNextPage: fetchNextParticipatedEvents,
    isFetchingNextPage: isFetchingNextParticipatedEvents,
  } = useGetParticipatedEvents(2);

  const updateProfile = useUpdateProfile();

  const isLoading = isProfileLoading || isParticipationsLoading;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <AppLoader fullScreen={false} message="Chargement de ton profil..." />
      </View>
    );
  }

  if (profileError !== null || !profile) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.center}>
          <AppText style={styles.errorText}>
            {profileError instanceof Error ? profileError.message : 'Impossible de charger le profil.'}
          </AppText>
        </View>
      </View>
    );
  }

  const allMyEvents = myEventsData?.pages.flatMap((page) => page.events) ?? [];
  const allParticipatedEvents = participatedEventsData?.pages.flatMap((page) => page.events) ?? [];

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingsHeader}>
          <AppIconsButton icon="settings" variant="eco" size={36} onPress={handleSettingsPress} />
        </View>

        <ProfileHeader pseudo={profile.pseudo} />

        <ProfileSection title="Ma Bio">
          <ProfileBio bio={profile.bio} />
          <View style={styles.editButtonContainer}>
            <AppButton
              variant="eco"
              size="small"
              text="Modifier"
              icon="edit-2"
              onPress={() => {
                setIsEditModalVisible(true);
              }}
            />
          </View>
        </ProfileSection>

        <ProfileSection title="Mes Statistiques">
          <ProfileStats
            impactScore={profile.totalImpactScore}
            badgesCount={profile.badges.length}
            eventsCount={participations?.length ?? 0}
          />
        </ProfileSection>

        <ProfileSection title="Mes Engagements">
          <AppCalendar />
        </ProfileSection>

        <ProfileSection title="Mes Badges">
          <ProfileBadges badges={profile.badges} />
        </ProfileSection>

        <ProfileSection title="Événements à venir">
          {isParticipatedEventsLoading ? (
            <ActivityIndicator color={theme.colors.primaryEco} />
          ) : allParticipatedEvents.length > 0 ? (
            <View>
              {allParticipatedEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {hasNextParticipatedEvents && (
                <View style={styles.seeMoreContainer}>
                  <AppButton
                    variant="eco"
                    size="small"
                    text={isFetchingNextParticipatedEvents ? 'Chargement...' : 'Voir plus'}
                    onPress={() => {
                      void fetchNextParticipatedEvents();
                    }}
                    disabled={isFetchingNextParticipatedEvents}
                  />
                </View>
              )}
            </View>
          ) : (
            <AppText style={styles.emptyText}>Aucun événement à venir pour le moment.</AppText>
          )}
        </ProfileSection>

        <ProfileSection title="Mes événements créés">
          {isMyEventsLoading ? (
            <ActivityIndicator color={theme.colors.primaryEco} />
          ) : allMyEvents.length > 0 ? (
            <View>
              {allMyEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
              {hasNextMyEvents && (
                <View style={styles.seeMoreContainer}>
                  <AppButton
                    variant="eco"
                    size="small"
                    text={isFetchingNextMyEvents ? 'Chargement...' : 'Voir plus'}
                    onPress={() => {
                      void fetchNextMyEvents();
                    }}
                    disabled={isFetchingNextMyEvents}
                  />
                </View>
              )}
            </View>
          ) : (
            <AppText style={styles.emptyText}>Aucun événement créé pour le moment.</AppText>
          )}
        </ProfileSection>

        <ProfileSection title="Mentions J'aime">
          <ComingSoonPlaceholder />
        </ProfileSection>

        <View style={styles.actions}>
          <View style={styles.buttonSpacer} />
          <AppButton
            variant="eco"
            text="Voir mes feedbacks"
            onPress={() => {
              navigate('ws-feedback');
            }}
          />
          <View style={styles.buttonSpacer} />
          <AppButton
            variant="danger"
            text="Se déconnecter"
            onPress={() => {
              void logout();
            }}
          />
        </View>

        <ProfileEditModal
          visible={isEditModalVisible}
          onClose={() => {
            setIsEditModalVisible(false);
          }}
          profile={profile}
          isLoading={updateProfile.isPending}
          onSubmit={(data) => {
            updateProfile.mutate(data, {
              onSuccess: () => {
                setIsEditModalVisible(false);
              },
            });
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
  settingsHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: -20,
    zIndex: 1,
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  actions: {
    marginTop: theme.spacing.md,
  },
  buttonSpacer: {
    height: theme.spacing.md,
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
