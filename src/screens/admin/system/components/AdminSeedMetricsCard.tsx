import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminCard } from '@/components/admin';
import type { SeedStatusResponse } from '@/api/admin/admin.system.api';

interface AdminSeedMetricsCardProps {
  seedStatus?: SeedStatusResponse;
  isLoading: boolean;
  onRefresh: () => void;
}

export const AdminSeedMetricsCard = ({
  seedStatus,
  isLoading,
  onRefresh,
}: AdminSeedMetricsCardProps): React.JSX.Element => {
  const hasMetrics =
    seedStatus !== undefined &&
    (seedStatus.users.success > 0 ||
      seedStatus.events.success > 0 ||
      seedStatus.posts.success > 0 ||
      seedStatus.durationMs > 0);

  return (
    <AdminCard style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <AppText style={styles.cardTitle}>Dernières Métriques du Seed</AppText>
        <AppButton
          text={isLoading ? 'Chargement...' : 'Actualiser'}
          variant="eco"
          size="small"
          icon="refresh-cw"
          disabled={isLoading}
          onPress={onRefresh}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={theme.colors.primaryEco} />
      ) : seedStatus !== undefined && hasMetrics ? (
        <View style={styles.metricsContainer}>
          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>
                {seedStatus.users.success}
                {seedStatus.users.failed > 0 && (
                  <AppText style={styles.metricFailed}> (-{seedStatus.users.failed})</AppText>
                )}
              </AppText>
              <AppText style={styles.metricLabel}>Utilisateurs</AppText>
            </View>

            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>
                {seedStatus.events.success}
                {seedStatus.events.failed > 0 && (
                  <AppText style={styles.metricFailed}> (-{seedStatus.events.failed})</AppText>
                )}
              </AppText>
              <AppText style={styles.metricLabel}>Événements</AppText>
            </View>

            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>
                {seedStatus.posts.success}
                {seedStatus.posts.failed > 0 && (
                  <AppText style={styles.metricFailed}> (-{seedStatus.posts.failed})</AppText>
                )}
              </AppText>
              <AppText style={styles.metricLabel}>Posts</AppText>
            </View>

            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{seedStatus.media.success}</AppText>
              <AppText style={styles.metricLabel}>Photos Stockage</AppText>
            </View>

            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{seedStatus.participations.success}</AppText>
              <AppText style={styles.metricLabel}>Participations</AppText>
            </View>

            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{seedStatus.wishes.success}</AppText>
              <AppText style={styles.metricLabel}>Favoris (Wishes)</AppText>
            </View>

            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{seedStatus.likes.success}</AppText>
              <AppText style={styles.metricLabel}>Likes</AppText>
            </View>

            <View style={styles.metricItem}>
              <AppText style={styles.metricValue}>{seedStatus.comments.success}</AppText>
              <AppText style={styles.metricLabel}>Commentaires</AppText>
            </View>
          </View>

          <View style={styles.durationRow}>
            <AppText style={styles.durationLabel}>Durée d'exécution totale :</AppText>
            <AppText style={styles.durationValue}>
              {(seedStatus.durationMs / 1000).toFixed(1)} s
            </AppText>
          </View>
        </View>
      ) : (
        <AppText style={styles.cardDesc}>
          Aucun rapport de seed enregistré pour le moment. Lancez un seed pour observer les
          statistiques de synchronisation en direct.
        </AppText>
      )}
    </AdminCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: theme.spacing.md,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
    paddingBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.black,
  },
  cardDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
    lineHeight: 20,
  },
  metricsContainer: {
    gap: theme.spacing.md,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  metricItem: {
    flex: 1,
    minWidth: '22%',
    backgroundColor: theme.colors.lightGrey + '30',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primaryEco,
  },
  metricFailed: {
    fontSize: 10,
    color: theme.colors.danger,
    fontWeight: '600',
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.grey,
    marginTop: 2,
    textAlign: 'center',
  },
  durationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.lightGrey,
  },
  durationLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.grey,
  },
  durationValue: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.black,
  },
});
