import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import {
  AppButton,
  AppText,
  AppHeader,
  AppLoader,
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
import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';
import { useGetParticipatedEvents } from '@/api/event/hooks/use-get-participated-events';
import { useGetWishedEvents } from '@/api/event/hooks/use-get-wished-events';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/stacks/ProfileStack';
import { WishedEventCard } from '@/components/dataDisplay/WishedEventCard';
import type { CalendarProps } from 'react-native-calendars';

type MarkedDates = NonNullable<CalendarProps['markedDates']>;

const handleSettingsPress = () => {
  Alert.alert('Paramètres', 'Coming soon ⚙️');
};

export function ProfileScreen(): React.JSX.Element {
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'participated' | 'created' | 'wished'>('participated');
  const { logout } = useAuth();
  const { navigate } = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile();
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

  const {
    data: wishedEventsData,
    isLoading: isWishedEventsLoading,
    hasNextPage: hasNextWishedEvents,
    fetchNextPage: fetchNextWishedEvents,
    isFetchingNextPage: isFetchingNextWishedEvents,
  } = useGetWishedEvents(2);

  const updateProfile = useUpdateProfile();

  const isLoading = isProfileLoading;

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
            {profileError instanceof Error
              ? profileError.message
              : 'Impossible de charger le profil.'}
          </AppText>
        </View>
      </View>
    );
  }

  const allMyEvents = myEventsData?.pages.flatMap((page) => page.events) ?? [];
  const allParticipatedEvents = participatedEventsData?.pages.flatMap((page) => page.events) ?? [];
  const allWishedEvents = wishedEventsData?.pages.flatMap((page) => page.events) ?? [];

  const markedDates: MarkedDates = {};
  allParticipatedEvents.forEach((event) => {
    if (event.startAt) {
      const dateStr = event.startAt.split('T')[0];
      if (dateStr != null) {
        markedDates[dateStr] = {
          customStyles: {
            container: {
              borderWidth: 2,
              borderColor: theme.colors.warning,
              borderRadius: 20,
            },
            text: {
              color: theme.colors.black,
              fontWeight: 'bold',
            },
          },
        };
      }
    }
  });
  allMyEvents.forEach((event) => {
    if (event.startAt) {
      const dateStr = event.startAt.split('T')[0];
      if (dateStr != null) {
        markedDates[dateStr] = {
          customStyles: {
            container: {
              borderWidth: 2,
              borderColor: theme.colors.primarySocio,
              borderRadius: 20,
            },
            text: {
              color: theme.colors.black,
              fontWeight: 'bold',
            },
          },
        };
      }
    }
  });

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
            eventsCount={participatedEventsData?.pages[0]?.totalCount ?? 0}
            createdCount={myEventsData?.pages[0]?.totalCount ?? 0}
          />
        </ProfileSection>

        <ProfileSection title="Mes Engagements">
          <AppCalendar markedDates={markedDates} />
        </ProfileSection>

        <ProfileSection title="Mes Badges">
          <ProfileBadges badges={profile.badges} />
        </ProfileSection>

        <View style={styles.tabBar}>
          <AppIconsButton
            icon="calendar"
            size={48}
            variant={activeTab === 'participated' ? 'socio' : 'white'}
            iconColor={activeTab === 'participated' ? theme.colors.white : theme.colors.grey}
            onPress={() => {
              setActiveTab('participated');
            }}
          />
          <AppIconsButton
            icon="heart"
            size={48}
            variant={activeTab === 'wished' ? 'danger' : 'white'}
            iconColor={activeTab === 'wished' ? theme.colors.white : theme.colors.grey}
            onPress={() => {
              setActiveTab('wished');
            }}
          />
          <AppIconsButton
            icon="plus"
            size={48}
            variant={activeTab === 'created' ? 'eco' : 'white'}
            iconColor={activeTab === 'created' ? theme.colors.white : theme.colors.grey}
            onPress={() => {
              setActiveTab('created');
            }}
          />
        </View>

        {activeTab === 'participated' && (
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
        )}

        {activeTab === 'created' && (
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
        )}

        {activeTab === 'wished' && (
          <ProfileSection title="Wishlist">
            {isWishedEventsLoading ? (
              <ActivityIndicator color={theme.colors.primaryEco} />
            ) : allWishedEvents.length > 0 ? (
              <View>
                {allWishedEvents.map((event) => (
                  <WishedEventCard key={event.id} event={event} />
                ))}
                {hasNextWishedEvents && (
                  <View style={styles.seeMoreContainer}>
                    <AppButton
                      variant="eco"
                      size="small"
                      text={isFetchingNextWishedEvents ? 'Chargement...' : 'Voir plus'}
                      onPress={() => {
                        void fetchNextWishedEvents();
                      }}
                      disabled={isFetchingNextWishedEvents}
                    />
                  </View>
                )}
              </View>
            ) : (
              <AppText style={styles.emptyText}>Aucun événement dans votre wishlist.</AppText>
            )}
          </ProfileSection>
        )}

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
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
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
