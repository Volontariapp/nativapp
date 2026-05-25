import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/typography/AppText';
import { AuthCard } from '@/components/layout/AuthCard';
import { EmailField } from '@/components/inputs/EmailField';
import { PasswordField } from '@/components/inputs/PasswordField';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/shared/themes/theme';
import { authApi } from '@/api/auth/auth.api';
import { BaseApiError } from '@volontariapp/errors';
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '@/navigation/stacks/AuthStack';

export function LoginScreen(): React.JSX.Element {
  const { login } = useAuth();
  const { navigate } = useNavigation<AuthNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (): Promise<void> => {
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.login({ email, password });
      if (response.auth) {
        await login(response.auth.accessToken, response.auth.refreshToken);
      }
    } catch (err) {
      if (err instanceof BaseApiError) {
        setError(err.message);
      } else {
        setError('Une erreur est survenue lors de la connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard title="Bienvenue !" subtitle="Connectez-vous pour continuer" error={error}>
      <EmailField value={email} onChangeText={setEmail} editable={!isLoading} />
      <PasswordField value={password} onChangeText={setPassword} editable={!isLoading} />

      <Pressable style={styles.forgotPassword}>
        <AppText style={styles.forgotPasswordText}>Mot de passe oublié ?</AppText>
      </Pressable>

      <View style={styles.spacer} />

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primaryEco} />
      ) : (
        <AppButton
          variant="eco"
          text="Se connecter"
          onPress={() => {
            void handleLogin();
          }}
        />
      )}

      <View style={styles.footer}>
        <AppText style={styles.footerText}>Nouveau parmi nous ? </AppText>
        <Pressable
          onPress={() => {
            navigate('register');
          }}
        >
          <AppText style={styles.footerLink}>S'inscrire</AppText>
        </Pressable>
      </View>
    </AuthCard>
  );
}

const styles = StyleSheet.create({
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  forgotPasswordText: {
    color: theme.colors.primaryEco,
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    color: theme.colors.grey,
    fontSize: 15,
  },
  footerLink: {
    color: theme.colors.primaryEco,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
