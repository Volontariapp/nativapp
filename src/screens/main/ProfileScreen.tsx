import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
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
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/shared/themes/theme';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useUserParticipations } from '@/api/social/hooks/use-user-participations';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/stacks/ProfileStack';

/**
 * Interface pour typer correctement la configuration du calendrier.
 */
interface CalendarLocale {
  monthNames: string[];
  monthNamesShort: string[];
  dayNames: string[];
  dayNamesShort: string[];
  today: string;
}

interface CalendarLocaleConfig {
  locales: Record<string, CalendarLocale>;
  defaultLocale: string;
}

const TypedLocaleConfig = LocaleConfig as unknown as CalendarLocaleConfig;
TypedLocaleConfig.locales['fr'] = {
  monthNames: [
    'Janvier',
    'Février',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juillet',
    'Août',
    'Septembre',
    'Octobre',
    'Novembre',
    'Décembre',
  ],
  monthNamesShort: [
    'Janv.',
    'Févr.',
    'Mars',
    'Avril',
    'Mai',
    'Juin',
    'Juil.',
    'Août',
    'Sept.',
    'Oct.',
    'Nov.',
    'Déc.',
  ],
  dayNames: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  dayNamesShort: ['Dim.', 'Lun.', 'Mar.', 'Mer.', 'Jeu.', 'Ven.', 'Sam.'],
  today: "Aujourd'hui",
};
TypedLocaleConfig.defaultLocale = 'fr';

export function ProfileScreen(): React.JSX.Element {
  const { logout } = useAuth();
  const { navigate } = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile();
  const { data: participations, isLoading: isParticipationsLoading } = useUserParticipations();

  const isLoading = isProfileLoading || isParticipationsLoading;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <AppLoader fullScreen={false} message="Chargement de ton profil..." />
      </View>
    );
  }

  if (profileError || !profile) {
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

  return (
    <View style={styles.container}>
      <AppHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader pseudo={profile.pseudo} />

        <ProfileSection title="Mes Statistiques">
          <ProfileStats
            impactScore={profile.totalImpactScore}
            badgesCount={profile.badges.length}
            eventsCount={participations?.length ?? 0}
          />
        </ProfileSection>

        <ProfileSection title="Ma Bio">
          <ProfileBio bio={profile.bio} />
        </ProfileSection>

        <ProfileSection title="Événements à venir">
          <ComingSoonPlaceholder />
        </ProfileSection>

        <ProfileSection title="Mes Engagements">
          <View style={styles.calendarContainer}>
            <Calendar
              theme={{
                backgroundColor: theme.colors.white,
                calendarBackground: theme.colors.white,
                textSectionTitleColor: theme.colors.grey,
                selectedDayBackgroundColor: theme.colors.primaryEco,
                selectedDayTextColor: theme.colors.white,
                todayTextColor: theme.colors.primaryEco,
                dayTextColor: theme.colors.black,
                arrowColor: theme.colors.primaryEco,
                monthTextColor: theme.colors.black,
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
                textMonthFontWeight: 'bold',
              }}
              style={styles.calendar}
            />
          </View>
        </ProfileSection>

        <ProfileSection title="Mes Badges">
          <ProfileBadges badges={profile.badges} />
        </ProfileSection>

        <ProfileSection title="Mentions J'aime">
          <ComingSoonPlaceholder />
        </ProfileSection>

        <View style={styles.actions}>
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
  calendarContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    ...theme.shadows.card,
  },
  calendar: {
    borderRadius: theme.radius.md,
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
});
