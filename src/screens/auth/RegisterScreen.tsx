import React, { useState } from 'react';
import { ActivityIndicator, Pressable, View, StyleSheet } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/typography/AppText';
import { AuthCard } from '@/components/layout/AuthCard';
import { AppInput } from '@/components/inputs/AppInput';
import { EmailField } from '@/components/inputs/EmailField';
import { PasswordField } from '@/components/inputs/PasswordField';
import { theme } from '@/shared/themes/theme';
import { authApi } from '@/api/auth/auth.api';
import type { SignUpCommand } from '@volontariapp/contracts';
import { BaseApiError } from '@volontariapp/errors';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import type { AuthNavigationProp } from '@/navigation/stacks/AuthStack';

interface RegisterState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
}

export const RegisterScreen = (): React.JSX.Element => {
  const { navigate } = useNavigation<AuthNavigationProp>();
  const { login } = useAuth();

  const [state, setState] = useState<RegisterState>({
    email: '',
    password: '',
    confirmPassword: '',
    isLoading: false,
    error: null,
  });

  const updateState = (updates: Partial<typeof state>): void => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleRegister = async (): Promise<void> => {
    if (!state.email || !state.password) {
      updateState({ error: 'Veuillez remplir email et mot de passe' });
      return;
    }

    updateState({ isLoading: true, error: null });

    try {
      const payload: SignUpCommand = {
        email: state.email,
        password: state.password,
      };

      const response = await authApi.register(payload);

      if (response.auth) {
        await login(response.auth.accessToken, response.auth.refreshToken);
      }
    } catch (err) {
      if (err instanceof BaseApiError) {
        updateState({ error: err.message });
      } else {
        updateState({ error: "Une erreur inattendue s'est produite." });
      }
    } finally {
      updateState({ isLoading: false });
    }
  };

  return (
    <AuthCard
      title="Créer un compte"
      subtitle="Rejoignez-nous en quelques clics"
      error={state.error}
    >
      <EmailField
        value={state.email}
        onChangeText={(v) => {
          updateState({ email: v });
        }}
        editable={!state.isLoading}
      />
      <PasswordField
        value={state.password}
        onChangeText={(v) => {
          updateState({ password: v });
        }}
        editable={!state.isLoading}
      />

      <AppInput
        label="Confirmer le mot de passe"
        placeholder="••••••••"
        secureTextEntry
        value={state.confirmPassword}
        onChangeText={(v) => {
          updateState({ confirmPassword: v });
        }}
        editable={!state.isLoading}
      />

      <View style={styles.spacer} />

      {state.isLoading ? (
        <ActivityIndicator size="large" color={theme.colors.primaryEco} />
      ) : (
        <AppButton
          variant="eco"
          text="S'inscrire"
          onPress={() => {
            void handleRegister();
          }}
        />
      )}

      <View style={styles.footer}>
        <AppText style={styles.footerText}>Déjà un compte ? </AppText>
        <Pressable
          onPress={() => {
            navigate('login');
          }}
        >
          <AppText style={styles.footerLink}>Se connecter</AppText>
        </Pressable>
      </View>
    </AuthCard>
  );
};

const styles = StyleSheet.create({
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
