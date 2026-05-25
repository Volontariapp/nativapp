import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { theme } from '@/themes/theme';
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '@/navigation/AuthStack';

export function OnboardingScreen(): React.JSX.Element {
  const navigation = useNavigation<AuthNavigationProp>();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          <AppText style={styles.title}>Bienvenue sur Volontariapp</AppText>
          <AppText style={styles.subtitle}>
            Découvrez et rejoignez des missions de volontariat autour de vous.
          </AppText>
        </View>
        <View style={styles.footer}>
          <AppButton
            variant="eco"
            text="Se connecter"
            onPress={() => {
              navigation.navigate('login');
            }}
          />
          <View style={styles.spacer} />
          <AppButton
            variant="secondary"
            text="S'inscrire"
            onPress={() => {
              navigation.navigate('register');
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.black,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.grey,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  spacer: {
    height: theme.spacing.md,
  },
});
