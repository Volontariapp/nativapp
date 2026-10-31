import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import {
  AppText,
  AppHeader,
  AppLoader,
  ProfileLayout,
  ProfileEditModal,
  AppIconsButton,
} from '@/components';
import { resolveAvatarUrl } from '@/api/user/resolve-avatar-url';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useProfile } from '@/api/user/hooks/use-profile';
import { useUpdateProfile } from '@/api/user/hooks/use-update-profile';
import { useGetFollows } from '@/api/social/hooks/use-get-follows';
import { useGetFollowers } from '@/api/social/hooks/use-get-followers';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { ProfilePosts } from '@/components/profile/profile-posts';
import { ProfileUpcomingEvents } from '@/components/profile/profile-upcoming-events';
import { ProfileFinishedEvents } from '@/components/profile/profile-finished-events';
import { ProfileManageEventsCta } from '@/components/profile/profile-manage-events-cta';
import { useGetMyPosts } from '@/api/post/hooks/use-get-my-posts';
import { useTabBarContentInset } from '@/navigation/hooks/useTabBarContentInset';
import { useProfileEvents } from './hooks/use-profile-events';

const MY_POSTS_PAGE_SIZE = 9;

export function ProfileScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const tabBarInset = useTabBarContentInset();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const mainNavigation = useNavigation<NavigationProp<MainStackParamList>>();

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

  const { upcoming, finished } = useProfileEvents();
  const {
    data: myPostsData,
    isLoading: isMyPostsLoading,
    hasNextPage: hasNextMyPosts,
    fetchNextPage: fetchNextMyPosts,
    isFetchingNextPage: isFetchingNextMyPosts,
  } = useGetMyPosts(MY_POSTS_PAGE_SIZE);
  const myPosts = myPostsData?.pages.flatMap((page) => page.posts) ?? [];

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
        contentContainerStyle={[styles.scrollContent, tabBarInset]}
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
          avatarUrl={resolveAvatarUrl(profile)}
          bio={profile.bio}
          impactScore={profile.totalImpactScore}
          badges={profile.badges}
          onSeeAllBadges={() => {
            mainNavigation.navigate('Badges');
          }}
          stats={[
            {
              label: 'Impact',
              value: profile.totalImpactScore,
              color: theme.colors.primaryEco,
            },
            {
              label: 'Follow',
              value: followersData?.pagination?.total ?? 0,
              color: theme.colors.primarySocio,
            },
            {
              label: 'Suivi(e)s',
              value: followsData?.pagination?.total ?? 0,
              color: theme.colors.warning,
            },
          ]}
        >
          <ProfilePosts
            posts={myPosts}
            isLoading={isMyPostsLoading}
            hasNextPage={hasNextMyPosts}
            fetchNextPage={() => {
              void fetchNextMyPosts();
            }}
            isFetchingNextPage={isFetchingNextMyPosts}
            contentInset={theme.spacing.xl}
            onCreatePress={() => {
              mainNavigation.navigate('MainTabs', {
                screen: 'create',
                params: { screen: 'PostForm' },
              });
            }}
          />

          <ProfileManageEventsCta
            onPress={() => {
              mainNavigation.navigate('MainTabs', {
                screen: 'create',
                params: { screen: 'ManageHub' },
              });
            }}
          />

          <ProfileUpcomingEvents data={upcoming} title="Prochain évènement" carousel />
          <ProfileFinishedEvents data={finished} />

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
    errorText: {
      color: theme.colors.danger,
      fontSize: 16,
      textAlign: 'center',
    },
  });
