import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Pressable,
  Switch,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminCard } from '@/components/admin';
import { useAdminHealth } from '@/api/admin/hooks/use-admin-health';
import { useSeedDatabaseMutation, useSeedStatusQuery } from '@/api/admin/hooks/useAdminSystemHooks';
import type { SeedPreset } from '@/api/admin/admin.system.api';

interface PresetConfig {
  id: SeedPreset;
  title: string;
  badge: string;
  users: number;
  events: number;
  posts: number;
  description: string;
}

const DEFAULT_PRESET_CONFIG: PresetConfig = {
  id: '500',
  title: '500 Écosystème',
  badge: 'Recommandé',
  users: 500,
  events: 500,
  posts: 500,
  description:
    '500 users, 500 events (avec matériels & quantités), 500 posts, photos dédiées en Île-de-France et historique pour le ranking.',
};

const PRESET_CONFIGS: PresetConfig[] = [
  DEFAULT_PRESET_CONFIG,
  {
    id: 'quick',
    title: 'Rapide (Quick)',
    badge: '~5s',
    users: 10,
    events: 15,
    posts: 25,
    description: 'Échantillon ultra-rapide pour valider les flux en développement local.',
  },
  {
    id: 'standard',
    title: 'Standard',
    badge: '~25s',
    users: 100,
    events: 100,
    posts: 100,
    description: 'Volume intermédiaire de 100 utilisateurs, événements et posts.',
  },
  {
    id: 'mega-1000',
    title: 'Massif 1000',
    badge: 'Complet',
    users: 1000,
    events: 1500,
    posts: 3500,
    description: 'Écosystème volumétrique complet à grande échelle.',
  },
];

export default function AdminSystemScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const { isHealthy, isLoading, error, latency, isChecking, handleManualCheck } = useAdminHealth();

  const [selectedPreset, setSelectedPreset] = useState<SeedPreset>('500');
  const [seedMedia, setSeedMedia] = useState<boolean>(true);

  const {
    mutate: seedDatabase,
    isPending: isSeeding,
    data: seedResult,
  } = useSeedDatabaseMutation();

  const {
    data: seedStatus,
    isLoading: isLoadingStatus,
    refetch: refetchStatus,
  } = useSeedStatusQuery({
    refetchInterval: isSeeding ? 3000 : false,
  });

  const activePresetConfig =
    PRESET_CONFIGS.find((p) => p.id === selectedPreset) ?? DEFAULT_PRESET_CONFIG;

  const handleLaunchSeed = () => {
    Alert.alert(
      `Confirmer le Seeding (${activePresetConfig.title})`,
      `Cette action va générer en arrière-plan :\n• ${String(activePresetConfig.users)} utilisateurs\n• ${String(activePresetConfig.events)} événements (avec matériels et quantités)\n• ${String(activePresetConfig.posts)} posts\n• Médias réels : ${seedMedia ? 'Oui' : 'Non'}\n\nContinuer ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Oui, générer',
          style: 'default',
          onPress: () => {
            seedDatabase({
              preset: selectedPreset,
              seedMedia,
            });
          },
        },
      ],
    );
  };

  const hasMetrics =
    seedStatus != null &&
    (seedStatus.users.success > 0 ||
      seedStatus.events.success > 0 ||
      seedStatus.posts.success > 0 ||
      seedStatus.durationMs > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppText style={styles.headerTitle}>Système & Santé</AppText>
        <AppText style={styles.headerSubtitle}>Surveillance des services de la plateforme</AppText>
      </View>

      <AdminCard hasBorder style={styles.card}>
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

      <AdminCard style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitle}>Génération de données (Seeding)</AppText>
          <View style={styles.presetBadgeMain}>
            <AppText style={styles.presetBadgeMainText}>500 Recommandé</AppText>
          </View>
        </View>

        <AppText style={styles.cardDesc}>
          Injecte un écosystème réaliste complet en Île-de-France : 500 utilisateurs uniques avec
          personas, 500 événements avec matériels & quantités contractuelles, 500 posts d’actualité
          et images dédiées.
        </AppText>

        {/* Sélecteur de preset */}
        <AppText style={styles.sectionLabel}>Choisir la volumétrie :</AppText>
        <View style={styles.presetsGrid}>
          {PRESET_CONFIGS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <Pressable
                key={preset.id}
                onPress={() => {
                  setSelectedPreset(preset.id);
                }}
                style={[styles.presetCard, isSelected && styles.presetCardSelected]}
              >
                <View style={styles.presetCardHeader}>
                  <AppText style={[styles.presetTitle, isSelected && styles.presetTitleSelected]}>
                    {preset.title}
                  </AppText>
                  <View
                    style={[styles.presetMiniBadge, isSelected && styles.presetMiniBadgeSelected]}
                  >
                    <AppText
                      style={[
                        styles.presetMiniBadgeText,
                        isSelected && styles.presetMiniBadgeTextSelected,
                      ]}
                    >
                      {preset.badge}
                    </AppText>
                  </View>
                </View>
                <AppText style={styles.presetCounts}>
                  {preset.users} users • {preset.events} events • {preset.posts} posts
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Résumé du preset actif */}
        <View style={styles.presetDetailBox}>
          <AppText style={styles.presetDetailTitle}>Détails de la configuration :</AppText>
          <AppText style={styles.presetDetailText}>• {activePresetConfig.description}</AppText>
          <AppText style={styles.presetDetailText}>
            • Matériels requis avec quantités (neededQuantity) selon les contrats Protobuf.
          </AppText>
          <AppText style={styles.presetDetailText}>
            • 60% d'événements futurs (+1j à +180j) et 40% d'événements passés (-90j à -1j).
          </AppText>
          <AppText style={styles.presetDetailText}>
            • Historique complet d’interactions pour alimenter l’algorithme de ranking IA.
          </AppText>
        </View>

        {/* Option Médias */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextContainer}>
            <AppText style={styles.toggleLabel}>Générer les médias réels (ms-storage)</AppText>
            <AppText style={styles.toggleSubLabel}>
              1 photo dédiée par événement et post téléversée en streaming
            </AppText>
          </View>
          <Switch
            value={seedMedia}
            onValueChange={setSeedMedia}
            trackColor={{ false: theme.colors.lightGrey, true: theme.colors.primaryEco }}
            thumbColor={theme.colors.white}
          />
        </View>

        {seedResult && (
          <View style={styles.seedResultContainer}>
            <AppText style={styles.seedResultTitle}>Processus démarré en arrière-plan :</AppText>
            <AppText style={styles.infoValue}>{seedResult.message}</AppText>
          </View>
        )}

        {/* Bouton de déclenchement */}
        <View style={styles.actionsGrid}>
          <AppButton
            text={
              isSeeding
                ? 'Génération en cours en tâche de fond...'
                : selectedPreset === '500'
                  ? 'Lancer le Seeding 500 (Recommandé)'
                  : `Lancer le Seeding (${activePresetConfig.title})`
            }
            variant="eco"
            loading={isSeeding}
            disabled={isSeeding}
            icon="database"
            onPress={handleLaunchSeed}
          />
        </View>
      </AdminCard>

      {/* Carte des métriques du dernier seed */}
      <AdminCard style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <AppText style={styles.cardTitle}>Dernières Métriques du Seed</AppText>
          <AppButton
            text={isLoadingStatus ? 'Chargement...' : 'Actualiser'}
            variant="eco"
            size="small"
            icon="refresh-cw"
            disabled={isLoadingStatus}
            onPress={() => {
              void refetchStatus();
            }}
          />
        </View>

        {isLoadingStatus ? (
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
  presetBadgeMain: {
    backgroundColor: theme.colors.primaryEco + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primaryEco + '40',
  },
  presetBadgeMainText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.primaryEco,
  },
  cardDesc: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
    marginTop: theme.spacing.xs,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  presetCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.lightGrey,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  presetCardSelected: {
    borderColor: theme.colors.primaryEco,
    backgroundColor: theme.colors.primaryEco + '08',
  },
  presetCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  presetTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.black,
  },
  presetTitleSelected: {
    color: theme.colors.primaryEco,
  },
  presetMiniBadge: {
    backgroundColor: theme.colors.lightGrey + '80',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  presetMiniBadgeSelected: {
    backgroundColor: theme.colors.primaryEco,
  },
  presetMiniBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.grey,
  },
  presetMiniBadgeTextSelected: {
    color: theme.colors.white,
  },
  presetCounts: {
    fontSize: 11,
    color: theme.colors.grey,
  },
  presetDetailBox: {
    backgroundColor: theme.colors.lightGrey + '40',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primaryEco,
    gap: 4,
  },
  presetDetailTitle: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: 2,
  },
  presetDetailText: {
    fontSize: 12,
    color: theme.colors.text,
    lineHeight: 17,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  toggleTextContainer: {
    flex: 1,
    paddingRight: theme.spacing.md,
  },
  toggleLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '600',
    color: theme.colors.black,
  },
  toggleSubLabel: {
    fontSize: 11,
    color: theme.colors.grey,
    marginTop: 2,
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
  seedResultContainer: {
    backgroundColor: theme.colors.lightGrey + '50',
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.xs,
  },
  seedResultTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
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
