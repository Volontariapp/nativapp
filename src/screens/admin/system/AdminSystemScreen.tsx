import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminHealthApi } from '@/api/admin/admin.health.api';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminCard } from '@/components/admin/AdminCard';

export default function AdminSystemScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const [latency, setLatency] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const {
    data: isHealthy,
    isLoading,
    error,
  } = useQuery<boolean>({
    queryKey: ['admin', 'healthStatus'],
    queryFn: async () => {
      const start = Date.now();
      await adminHealthApi.checkHealth();
      setLatency(Date.now() - start);
      return true;
    },
    retry: false,
  });

  const handleManualCheck = async (): Promise<void> => {
    setIsChecking(true);
    try {
      const start = Date.now();
      await adminHealthApi.checkHealth();
      setLatency(Date.now() - start);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'healthStatus'] });
      Alert.alert('Succès', 'Le serveur répond normalement.');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      Alert.alert('Erreur', `Le serveur est injoignable : ${errorMsg}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Système & Santé</AppText>
        <AppText style={styles.headerSubtitle}>Surveillance des services de la plateforme</AppText>
      </View>

      <AdminCard style={styles.card}>
        <AppText style={styles.cardTitle}>Statut Général</AppText>

        <View style={styles.statusRow}>
          <AppText style={styles.statusLabel}>Statut de l'API Gateway :</AppText>
          {isLoading || isChecking ? (
            <ActivityIndicator size="small" color={theme.colors.primarySocio} />
          ) : error != null || isHealthy !== true ? (
            <View style={[styles.statusBadge, styles.statusOffline]}>
              <AppText style={styles.statusTextOffline}>HORS LIGNE</AppText>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusOnline]}>
              <AppText style={styles.statusTextOnline}>OPÉRATIONNEL</AppText>
            </View>
          )}
        </View>

        {latency !== null && (
          <View style={styles.statusRow}>
            <AppText style={styles.statusLabel}>Temps de réponse (RRT) :</AppText>
            <AppText style={styles.latencyValue}>{latency} ms</AppText>
          </View>
        )}

        <View style={styles.statusRow}>
          <AppText style={styles.statusLabel}>Version de l'API :</AppText>
          <AppText style={styles.infoValue}>v1.0.0 (Production)</AppText>
        </View>

        <AppButton
          text={isChecking ? 'Vérification...' : 'Lancer un diagnostic'}
          variant="eco"
          icon="activity"
          onPress={() => {
            void handleManualCheck();
          }}
          disabled={isChecking}
        />
      </AdminCard>

      <AdminCard style={styles.card}>
        <AppText style={styles.cardTitle}>Options de Maintenance</AppText>
        <AppText style={styles.cardDesc}>
          Actions d'administration globale pour le nettoyage ou la synchronisation de données.
        </AppText>

        <View style={styles.actionsGrid}>
          <AppButton
            text="Vider le cache de l'App"
            variant="eco"
            onPress={() => {
              queryClient.clear();
              Alert.alert('Succès', 'Le cache local des requêtes a été vidé.');
            }}
          />
          <AppButton
            text="Simuler une alerte"
            variant="danger"
            onPress={() => {
              Alert.alert('Alerte système', 'Ceci est une simulation de panne serveur.');
            }}
          />
        </View>
      </AdminCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.black,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.grey,
    marginTop: theme.spacing.xs,
  },
  card: {
    gap: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.black,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
    paddingBottom: theme.spacing.sm,
  },
  cardDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  statusLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
  },
  latencyValue: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.primaryEco,
  },
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  statusOnline: {
    backgroundColor: theme.colors.success + '20',
  },
  statusOffline: {
    backgroundColor: theme.colors.danger + '20',
  },
  statusTextOnline: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.success,
  },
  statusTextOffline: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.danger,
  },
  actionsGrid: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
});
