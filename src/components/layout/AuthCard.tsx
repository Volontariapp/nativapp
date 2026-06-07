import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import logo from '../../../assets/logo.jpg';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';
import { AppKeyboardScrollView } from '@/components/layout/AppKeyboardScrollView';

interface AuthCardProps {
  title: string;
  subtitle: string;
  error: string | null;
  children: React.ReactNode;
}

export const AuthCard = ({ title, subtitle, error, children }: AuthCardProps): React.ReactNode => {
  return (
    <AppKeyboardScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      bottomOffset={16}
    >
      <View style={styles.header}>
        <Image source={logo} style={styles.logo} contentFit="contain" />
        <AppText style={styles.title}>{title}</AppText>
        <AppText style={styles.subtitle}>{subtitle}</AppText>
      </View>

      <View style={styles.formContainer}>
        {error !== null && (
          <View style={styles.errorContainer}>
            <AppText style={styles.errorText}>{error}</AppText>
          </View>
        )}
        {children}
      </View>
    </AppKeyboardScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl * 2,
    paddingBottom: theme.spacing.xxl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.grey,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    ...theme.shadows.card,
  },
  errorContainer: {
    backgroundColor: theme.colors.danger + '1A', // 10% opacity
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
});
