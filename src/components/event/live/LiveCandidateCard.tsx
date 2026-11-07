import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveEventCandidate } from '@/api/event/live-events.utils';
import { formatParticipantsCount, formatWalkDuration } from './live-format.utils';

export interface LiveCandidateCardProps {
  candidate: LiveEventCandidate;
  rank: number;
  isParticipating: boolean;
  onParticipate: (candidate: LiveEventCandidate) => void;
  onSelect: (candidate: LiveEventCandidate) => void;
}

export function LiveCandidateCard({
  candidate,
  rank,
  isParticipating,
  onParticipate,
  onSelect,
}: LiveCandidateCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { event, walkSeconds, isEstimated } = candidate;

  return (
    <View style={styles.card} testID={`live-candidate-${event.id}`}>
      <Pressable
        style={styles.body}
        onPress={() => {
          onSelect(candidate);
        }}
        accessibilityRole="button"
        accessibilityLabel={`Voir le trajet vers ${event.title}`}
      >
        <AppText style={styles.rank}>{`${String(rank)}.`}</AppText>
        <View style={styles.details}>
          <AppText style={styles.title} numberOfLines={1}>
            {event.title}
          </AppText>
          <View style={styles.metaRow}>
            <AppIcons icon="navigation" size={13} color={theme.colors.grey} />
            <AppText style={styles.meta}>
              {isEstimated
                ? `${formatWalkDuration(walkSeconds)} (estimé)`
                : formatWalkDuration(walkSeconds)}
            </AppText>
            <AppIcons icon="users" size={13} color={theme.colors.grey} />
            <AppText style={styles.meta}>{formatParticipantsCount(event)}</AppText>
          </View>
        </View>
      </Pressable>
      <AppButton
        text="Participer"
        size="small"
        variant="eco"
        loading={isParticipating}
        testID={`live-participate-${event.id}`}
        onPress={() => {
          onParticipate(candidate);
        }}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.lightGrey,
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    body: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    rank: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
    },
    details: {
      flex: 1,
      gap: theme.spacing.xs,
    },
    title: {
      fontSize: 15,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs + 1,
    },
    meta: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
      marginRight: theme.spacing.sm,
    },
  });
