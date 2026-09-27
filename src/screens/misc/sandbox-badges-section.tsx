import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { Badges, Badge } from '@/components/dataDisplay/badge';
import { theme } from '@/shared/themes/theme';

export function SandboxBadgesSection(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AppText variant="caption" style={styles.hintText}>
        Appuyez sur un badge pour ouvrir ses détails (nom et description).
      </AppText>

      <View style={styles.subGroup}>
        <AppText variant="subtitle" style={styles.groupTitle}>
          Badges de participation
        </AppText>
        <View style={styles.badgeGrid}>
          <Badges.EVENT_PARTICIPATION_TIER_1 showLabel />
          <Badges.EVENT_PARTICIPATION_TIER_2 showLabel />
          <Badges.EVENT_PARTICIPATION_TIER_3 showLabel />
          <Badges.EVENT_PARTICIPATION_TIER_4 showLabel />
          <Badges.EVENT_SOCIAL_TIER_1 showLabel />
          <Badges.EVENT_SOCIAL_TIER_2 showLabel />
          <Badges.EVENT_ECOLOGY_TIER_1 showLabel />
          <Badges.EVENT_ECOLOGY_TIER_2 showLabel />
          <Badges.EVENT_HYBRID_ECO_SOCIAL_TIER_1 showLabel />
        </View>
      </View>

      <View style={styles.subGroup}>
        <AppText variant="subtitle" style={styles.groupTitle}>
          Badges d’interaction
        </AppText>
        <View style={styles.badgeGrid}>
          <Badges.SOCIAL_LIKE_COUNT_10 showLabel />
          <Badges.EVENT_WISHLIST_COUNT_10 showLabel />
          <Badges.COMMUNITY_POST_COUNT_1 showLabel />
          <Badges.EVENT_HOST_COUNT_1 showLabel />
        </View>
      </View>

      <View style={styles.subGroup}>
        <AppText variant="subtitle" style={styles.groupTitle}>
          Tailles disponibles (sm, md, lg)
        </AppText>
        <View style={styles.sizesRow}>
          <Badge variant="EVENT_PARTICIPATION_TIER_4" size="sm" showLabel />
          <Badge variant="EVENT_PARTICIPATION_TIER_4" size="md" showLabel />
          <Badge variant="EVENT_PARTICIPATION_TIER_4" size="lg" showLabel />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.lg,
  },
  hintText: {
    color: theme.colors.grey,
    fontStyle: 'italic',
  },
  subGroup: {
    gap: theme.spacing.sm,
  },
  groupTitle: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    alignItems: 'flex-start',
  },
  sizesRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: theme.spacing.xl,
  },
});
