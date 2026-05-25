import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { AppButton } from '@/components/AppButton';
import { AppText } from '@/components/AppText';
import { useAuth } from '@/context/AuthContext';
import { theme } from '@/themes/theme';
import { authApi } from '@/api/auth/auth.api';
import { BaseApiError } from '@volontariapp/errors';
import { useNavigation } from '@react-navigation/native';
import type { AuthNavigationProp } from '@/navigation/AuthStack';

export function LoginScreen(): React.JSX.Element {
  const { login } = useAuth();
  const navigation = useNavigation<AuthNavigationProp>();

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppText style={styles.title}>Bienvenue !</AppText>
          <AppText style={styles.subtitle}>Connectez-vous pour continuer</AppText>
        </View>

        <View style={styles.formContainer}>
          {error !== null && (
            <View style={styles.errorContainer}>
              <AppText style={styles.errorText}>{error}</AppText>
            </View>
          )}

          <AppText style={styles.label}>Adresse e-mail</AppText>
          <TextInput
            style={styles.input}
            placeholder="jean.dupont@email.com"
            placeholderTextColor={theme.colors.grey}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
          />

          <AppText style={styles.label}>Mot de passe</AppText>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={theme.colors.grey}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />

          <TouchableOpacity style={styles.forgotPassword}>
            <AppText style={styles.forgotPasswordText}>Mot de passe oublié ?</AppText>
          </TouchableOpacity>

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
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('register');
              }}
            >
              <AppText style={styles.footerLink}>S'inscrire</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.grey,
  },
  formContainer: {
    backgroundColor: '#ffffff',
    padding: theme.spacing.xl,
    borderRadius: theme.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.black,
    marginBottom: theme.spacing.lg,
  },
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
