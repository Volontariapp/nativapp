import React, { useMemo, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { EventState } from '@volontariapp/contracts';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { EventStatusBadge } from '@/components/event/EventStatusBadge';
import { getEventTone } from '@/components/profile/event-tone.utils';
import { getEventImageUri } from '@/api/event/event-cover.utils';
import type { AppEvent } from '@/api/event/event.api';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import {
  formatParticipantsCount,
  formatRemainingTime,
  formatWalkDuration,
} from './live-format.utils';

export interface LiveEventCardProps {
  event: AppEvent;
  /** Temps de marche depuis ma position ; absent : non affiche. */
  walkSeconds?: number;
  isEstimated?: boolean;
  /** Rang dans la liste, affiche devant le titre. */
  rank?: number;
  /** Carte grisee (evenement complet). */
  muted?: boolean;
  /** Boutons d'action, sous les informations. */
  children?: ReactNode;
  /** Contenu pleine largeur sous les actions (ex. bascule de partage). */
  footer?: ReactNode;
  testID?: string;
}

const ICON_SIZE = 14;

/**
 * Carte d'un evenement en direct : meme gabarit que la carte du profil (photo de couverture,
 * titre, badge de statut, details), avec les infos propres au direct.
 */
export function LiveEventCard({
  event,
  walkSeconds,
  isEstimated = false,
  rank,
  muted = false,
  children,
  footer,
  testID,
}: LiveEventCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const tone = getEventTone(event.type, theme);
  const now = useMemo(() => Date.now(), [event.endAt]);
  const walkLabel =
    walkSeconds === undefined
      ? null
      : isEstimated
        ? `${formatWalkDuration(walkSeconds)} (estimé)`
        : formatWalkDuration(walkSeconds);

  return (
    <View style={[styles.card, muted && styles.cardMuted]} testID={testID}>
      <Image
        testID="live-event-cover"
        source={{ uri: getEventImageUri(event) }}
        style={styles.cover}
        contentFit="cover"
        cachePolicy="memory-disk"
        accessibilityIgnoresInvertColors
      />
      <View style={styles.content}>
        <View style={styles.badges}>
          {rank !== undefined && (
            <AppText style={[styles.rank, { color: tone.accent }]}>{`${String(rank)}.`}</AppText>
          )}
          <EventStatusBadge state={EventState.EVENT_STATE_IN_PROGRESS} size="sm" />
        </View>
        <AppText style={styles.title} numberOfLines={2}>
          {event.title}
        </AppText>
        <View style={styles.metaRow}>
          <View style={styles.meta}>
            <AppIcons icon="users" size={ICON_SIZE} color={theme.colors.grey} />
            <AppText style={styles.metaText}>{formatParticipantsCount(event)}</AppText>
          </View>
          {walkLabel !== null && (
            <View style={styles.meta}>
              <AppIcons icon="navigation" size={ICON_SIZE} color={theme.colors.grey} />
              <AppText style={styles.metaText}>{walkLabel}</AppText>
            </View>
          )}
          <View style={styles.meta}>
            <AppIcons icon="clock" size={ICON_SIZE} color={theme.colors.grey} />
            <AppText style={styles.metaText}>{formatRemainingTime(event.endAt, now)}</AppText>
          </View>
        </View>
        {children !== undefined && <View style={styles.actions}>{children}</View>}
        {footer}
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      marginBottom: theme.spacing.md,
      ...theme.shadows.card,
    },
    cardMuted: {
      opacity: 0.6,
    },
    cover: {
      width: '100%',
      height: 120,
      backgroundColor: theme.colors.skeletonGrey,
    },
    content: {
      padding: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    rank: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
    },
    title: {
      fontSize: theme.typography.fontSize.md,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs + 1,
    },
    metaText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
  });
