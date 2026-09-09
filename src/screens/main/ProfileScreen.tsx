import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  AppButton,
  AppText,
  AppHeader,
  AppLoader,
  ProfileLayout,
  ProfileSection,
  ProfileEditModal,
  AppIconsButton,
  AppCalendar,
} from '@/components';
import { useAuth } from '@/context/AuthContext';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useUpdateProfile } from '@/api/user/hooks/use-update-profile';
import { useGetFollows } from '@/api/social/hooks/use-get-follows';
import { useGetFollowers } from '@/api/social/hooks/use-get-followers';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/stacks/ProfileStack';
import { useProfileEvents } from './hooks/use-profile-events';

export function ProfileScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const { logout } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  const { data: profile, isLoading: isProfileLoading, error: profileError } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: followsData } = useGetFollows(
    profile?.id ?? '',
    { page: 1, limit: 1 },
    Boolean(profile?.id),
  );
  const { data: followersData } = useGetFollowers(
    profile?.id ?? '',
    { page: 1, limit: 1 },
    Boolean(profile?.id),
  );

  const { participated, created, wished, markedDates } = useProfileEvents(theme);

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

  return (
    <View style={styles.container}>
      <AppHeader showSettings={true} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingsHeader}>
          <AppIconsButton
            icon="edit-2"
            variant="eco"
            size={36}
            onPress={() => {
              setIsEditModalVisible(true);
            }}
          />
        </View>

        <ProfileLayout
          pseudo={profile.pseudo}
          avatarUrl={profile.logoPath}
          bio={profile.bio}
          badges={profile.badges}
          stats={[
            {
              label: 'Abonnés',
              value: followersData?.pagination?.total ?? 0,
              color: theme.colors.primarySocio,
            },
            {
              label: 'Abonnements',
              value: followsData?.pagination?.total ?? 0,
              color: theme.colors.warning,
            },
            {
              label: 'Évents créés',
              value: created.totalCount || created.events.length,
              color: theme.colors.primarySocio,
            },
          ]}
          eventsTabs={{
            participated,
            created,
            wished,
          }}
        >
          <ProfileSection title="Mes Engagements">
            <AppCalendar markedDates={markedDates} />
          </ProfileSection>

          <View style={styles.actions}>
            <View style={styles.buttonSpacer} />
            <AppButton
              variant="eco"
              text="Voir mes feedbacks"
              onPress={() => {
                navigation.navigate('ws-feedback');
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
        </ProfileLayout>
      </ScrollView>
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
      marginVertical: theme.spacing.lg,
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
