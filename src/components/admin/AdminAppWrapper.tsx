import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { authApi } from '@/api/auth/auth.api';
import { helperApi } from '@/api/helper/helper.api';
import { useAuth } from '@/context/AuthContext';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface AdminAppWrapperProps {
  children: React.ReactNode;
}

export const AdminAppWrapper = ({ children }: AdminAppWrapperProps): React.JSX.Element => {
  const [loading, setLoading] = useState(true);
  const { login, logout } = useAuth();
  const loginRef = useRef(login);
  const logoutRef = useRef(logout);
  const setupRan = useRef(false);

  useEffect(() => {
    loginRef.current = login;
  }, [login]);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    if (setupRan.current) return;
    setupRan.current = true;

    let mounted = true;
    const doLogout = logoutRef.current;

    const setupAdmin = async (): Promise<void> => {
      try {
        const randomStr = Math.random().toString(36).substring(7);
        const email = `admin-super-${randomStr}@test.com`;
        const password = 'password123';

        const registerRes = await authApi.register({ email, password });
        const userId = registerRes.user?.id;
        if (userId == null) throw new Error('Pas de user ID retourné par register');

        const helperRes = await helperApi.generateAccessToken(userId, 'ADMIN');

        const refreshToken = registerRes.auth?.refreshToken ?? '';
        await loginRef.current(helperRes.token, refreshToken);

        if (mounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Admin Setup Error:', err instanceof Error ? err.message : String(err));
        if (mounted) setLoading(false);
      }
    };

    void setupAdmin();

    return (): void => {
      mounted = false;
      void doLogout();
    };
  }, []); // Empty deps: intentional — login/logout accessed via stable refs

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primarySocio} />
        <AppText style={styles.text}>Initialisation Super Admin…</AppText>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    gap: theme.spacing.lg,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.grey,
  },
});
