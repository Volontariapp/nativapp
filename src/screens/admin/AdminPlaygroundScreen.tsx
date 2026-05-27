import React, { useEffect, useState, use } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { authApi } from '@/api/auth/auth.api';
import { helperApi } from '@/api/helper/helper.api';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { AdminContext } from '@/context/admin/admin.context';

export default function AdminPlaygroundScreen(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ email: string; id: string } | null>(null);
  const { login, logout } = useAuth();
  const { isConnected } = useSocket();
  const { setMode } = use(AdminContext);

  useEffect(() => {
    let mounted = true;

    const setupAdmin = async (): Promise<void> => {
      try {
        const randomStr = Math.random().toString(36).substring(7);
        const email = `admin-playground-${randomStr}@test.com`;
        const password = 'password123';

        const registerRes = await authApi.register({ email, password });
        const userId = registerRes.user?.id;
        if (userId == null) throw new Error('Pas de user ID retourné par register');

        const helperRes = await helperApi.generateAccessToken(userId, 'ADMIN');

        const refreshToken = registerRes.auth?.refreshToken ?? '';
        await login(helperRes.token, refreshToken);

        if (mounted) {
          setUserInfo({ email, id: userId });
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (mounted) setLoading(false);
      }
    };

    void setupAdmin();

    return (): void => {
      mounted = false;
      void logout();
    };
  }, [login, logout]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Création de l'admin en cours…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Admin Playground</Text>

      {userInfo && (
        <View style={styles.card}>
          <Text style={styles.text}>✅ Admin Créé en BDD</Text>
          <Text style={styles.text}>Email : {userInfo.email}</Text>
          <Text style={styles.text}>ID : {userInfo.id}</Text>
          <Text style={styles.text}>
            WS Status : {isConnected ? 'Connecté 🟢' : 'Déconnecté 🔴'}
          </Text>
        </View>
      )}

      <Button
        title="Retour au Menu (Nettoyer)"
        onPress={(): void => {
          setMode('menu');
        }}
        color="red"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    gap: 10,
  },
  text: {
    fontSize: 16,
  },
});
