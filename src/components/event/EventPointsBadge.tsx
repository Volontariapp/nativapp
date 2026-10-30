import React, { useMemo } from 'react';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { ImpactScoreBadge } from '@/components/event/ImpactScoreBadge';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import {
  estimateEventPointsRange,
  isLegacyScoring,
} from '@/shared/lib/event-points-estimate.utils';
import type { EventPointsRange } from '@/shared/lib/event-points-estimate.utils';

type EventPointsBadgeEvent = Pick<
  AppEvent,
  'awardedImpactScore' | 'scoringVersion' | 'maxParticipants' | 'startAt' | 'endAt' | 'organizerId'
>;

interface EventPointsBadgeProps {
  event: EventPointsBadgeEvent;
  /** 'badge' : pastille doree ; 'chip' : puce de la fiche apercu. */
  variant?: 'badge' | 'chip';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const formatEstimateLabel = ({ min, max }: EventPointsRange): string =>
  min === max
    ? `Estimation : ${String(max)} pts`
    : `Estimation : de ${String(min)} à ${String(max)} pts`;

/**
 * Points affichés pour un événement :
 * - ancien barème (scoringVersion absent ou < 1) : points fixes exacts, badge historique ;
 * - barème v1 : fourchette estimée pour une salle pleine, clairement libellée comme telle ;
 * - sinon : rien.
 */
export function EventPointsBadge({
  event,
  variant = 'badge',
  style,
  textStyle,
}: EventPointsBadgeProps): React.JSX.Element | null {
  const { awardedImpactScore, scoringVersion, maxParticipants, startAt, endAt, organizerId } =
    event;
  const legacy = isLegacyScoring(scoringVersion);

  const range = useMemo(
    () =>
      legacy ? null : estimateEventPointsRange({ startAt, endAt, maxParticipants, organizerId }),
    [legacy, startAt, endAt, maxParticipants, organizerId],
  );

  const label = legacy
    ? awardedImpactScore > 0
      ? `+${String(awardedImpactScore)} pts d'impact`
      : null
    : range
      ? formatEstimateLabel(range)
      : null;
  if (label === null) return null;

  if (variant === 'chip') {
    return (
      <View style={style}>
        <Feather name="award" size={14} color={theme.colors.primaryEco} />
        <AppText style={textStyle}>{label}</AppText>
      </View>
    );
  }

  if (legacy) return <ImpactScoreBadge score={awardedImpactScore} style={style} />;
  return <ImpactScoreBadge score={range?.max ?? 0} label={label} style={style} />;
}
