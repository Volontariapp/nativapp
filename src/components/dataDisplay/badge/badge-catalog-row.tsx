import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { Badge } from './badge';
import type { BadgeCatalogEntry } from './badge-catalog.types';

interface BadgeCatalogRowProps {
  entry: BadgeCatalogEntry;
}

/**
 * Une ligne du catalogue : médaillon, nom et règle de déblocage. Un badge verrouillé est atténué
 * et met sa règle en avant (« Comment l'obtenir »), un badge obtenu porte la pastille « Débloqué ».
 */
export const BadgeCatalogRow = ({ entry }: BadgeCatalogRowProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { definition, unlocked, variant } = entry;

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${definition.name}, ${unlocked ? 'débloqué' : 'verrouillé'}`}
    >
      <Badge variant={variant} size="md" style={unlocked ? undefined : styles.locked} />

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <AppText style={styles.name} numberOfLines={1}>
            {definition.name}
          </AppText>
          {unlocked ? (
            <View style={styles.unlockedPill}>
              <AppIcons
                icon="check"
                iconLibrary="Feather"
                size={12}
                color={theme.colors.badgeGreen}
              />
              <AppText style={styles.unlockedText}>Débloqué</AppText>
            </View>
          ) : (
            <AppIcons icon="lock" iconLibrary="Feather" size={16} color={theme.colors.grey} />
          )}
        </View>

        {!unlocked && <AppText style={styles.kicker}>Comment l'obtenir</AppText>}
        <AppText style={unlocked ? styles.rule : styles.lockedRule}>
          {definition.description}
        </AppText>
      </View>
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      ...theme.shadows.card,
    },
    locked: {
      opacity: 0.4,
    },
    body: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    name: {
      flex: 1,
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
    },
    unlockedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      backgroundColor: theme.colors.badgeGreenBackground,
    },
    unlockedText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.badgeGreen,
    },
    kicker: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    rule: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.grey,
    },
    lockedRule: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.black,
    },
  });
