import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/buttons/AppButton';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveEventCandidate } from '@/api/event/live-events.utils';
import { LiveEventCard } from './LiveEventCard';
import { LiveEventIconActions } from './LiveEventIconActions';

export interface LiveCandidateCardProps {
  candidate: LiveEventCandidate;
  rank: number;
  isParticipating: boolean;
  onParticipate: (candidate: LiveEventCandidate) => void;
  onSelect: (candidate: LiveEventCandidate) => void;
  onOpenDetail: (candidate: LiveEventCandidate) => void;
}

export function LiveCandidateCard({
  candidate,
  rank,
  isParticipating,
  onParticipate,
  onSelect,
  onOpenDetail,
}: LiveCandidateCardProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const { event, walkSeconds, isEstimated } = candidate;

  return (
    <LiveEventCard
      event={event}
      walkSeconds={walkSeconds}
      isEstimated={isEstimated}
      rank={rank}
      testID={`live-candidate-${event.id}`}
    >
      <LiveEventIconActions
        eventId={event.id}
        onShowRoute={() => {
          onSelect(candidate);
        }}
        onOpenDetail={() => {
          onOpenDetail(candidate);
        }}
      />
      <View style={styles.participate}>
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
    </LiveEventCard>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    participate: {
      flex: 1,
      alignItems: 'flex-end',
      paddingLeft: theme.spacing.sm,
    },
  });
