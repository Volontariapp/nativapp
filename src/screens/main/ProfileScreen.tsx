import { View, StyleSheet } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import React, { useEffect, useState } from 'react';
import { AppText } from '@/components/typography/AppText';
import { useAuth } from '@/context/AuthContext';
import AppHeader from '@/components/layout/AppHeader';
import { AppLoader } from '@/components/feedback/AppLoader';
import { theme } from '@/themes/theme';
import { userApi, type UserProfile } from '@/api/user/user.api';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/navigation/stacks/ProfileStack';

export function ProfileScreen(): React.JSX.Element {
  const { logout } = useAuth();
  const { navigate } = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async (): Promise<void> => {
      try {
        const data: UserProfile = await userApi.getMe();
        setProfile(data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Impossible de charger le profil.');
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchProfile();
  }, []);

  return (
    <View style={styles.container}>
      <AppHeader />
      <View style={styles.content}>
        <AppText style={styles.title}>Mon Profil</AppText>

        {loading ? (
          <AppLoader fullScreen={false} message="Chargement du profil..." />
        ) : error !== null ? (
          <AppText style={styles.errorText}>{error}</AppText>
        ) : profile !== null ? (
          <View style={styles.card}>
            <AppText style={styles.label}>ID Utilisateur :</AppText>
            <AppText style={styles.value}>{profile.id}</AppText>

            <AppText style={styles.label}>Adresse Email :</AppText>
            <AppText style={styles.value}>{profile.email}</AppText>

            <AppText style={styles.label}>Pseudo :</AppText>
            <AppText style={styles.value}>{profile.pseudo}</AppText>

            <AppText style={styles.label}>Rôle :</AppText>
            <AppText style={styles.value}>{profile.role}</AppText>

            <AppText style={styles.label}>Score d'impact :</AppText>
            <AppText style={styles.value}>{profile.totalImpactScore}</AppText>
          </View>
        ) : null}

        <View style={styles.spacer} />
        <AppButton
          variant={'eco'}
          text="WS Feedback"
          onPress={() => {
            navigate('ws-feedback');
          }}
        />
        <View style={{ height: theme.spacing.md }} />
        <AppButton
          variant={'danger'}
          text="Se déconnecter"
          onPress={() => {
            void logout();
          }}
        />
        <View style={{ height: theme.spacing.xxl * 2 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: theme.spacing.xl,
  },
  label: {
    fontSize: 14,
    color: theme.colors.grey,
    marginTop: theme.spacing.md,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: theme.spacing.xl,
  },
  spacer: {
    flex: 1,
  },
});
