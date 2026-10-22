import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Switch, Alert } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AdminCard } from '@/components/admin';
import type { SeedOptions, SeedPreset, SeedBackgroundResponse } from '@/api/admin/admin.system.api';

export interface PresetConfig {
  id: SeedPreset;
  title: string;
  badge: string;
  users: number;
  events: number;
  posts: number;
  description: string;
}

export const DEFAULT_PRESET_CONFIG: PresetConfig = {
  id: '500',
  title: '500 Écosystème',
  badge: 'Recommandé',
  users: 500,
  events: 500,
  posts: 500,
  description:
    '500 users, 500 events (avec matériels & quantités), 500 posts, photos dédiées en Île-de-France et historique pour le ranking.',
};

export const PRESET_CONFIGS: PresetConfig[] = [
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

interface AdminSeedCardProps {
  isSeeding: boolean;
  seedResult?: SeedBackgroundResponse;
  onSeed: (options: SeedOptions) => void;
}

export const AdminSeedCard = ({
  isSeeding,
  seedResult,
  onSeed,
}: AdminSeedCardProps): React.JSX.Element => {
  const [selectedPreset, setSelectedPreset] = useState<SeedPreset>('500');
  const [seedMedia, setSeedMedia] = useState<boolean>(true);

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
            onSeed({
              preset: selectedPreset,
              seedMedia,
            });
          },
        },
      ],
    );
  };

  return (
    <AdminCard style={styles.card}>
      <View style={styles.cardHeaderRow}>
        <AppText style={styles.cardTitle}>Génération de données (Seeding)</AppText>
        <View style={styles.presetBadgeMain}>
          <AppText style={styles.presetBadgeMainText}>500 Recommandé</AppText>
        </View>
      </View>

      <AppText style={styles.cardDesc}>
        Injecte un écosystème réaliste complet en Île-de-France : 500 utilisateurs uniques avec
        personas, 500 événements avec matériels & quantités contractuelles, 500 posts d’actualité et
        images dédiées.
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
  infoValue: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
  },
});
