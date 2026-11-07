import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { LiveSharingStatus, LiveSharingStop } from '@/hooks/live-sharing.types';
import { LIVE_SHARING_STOP_MESSAGES } from '@/hooks/live-sharing.utils';

export const LIVE_SHARING_LABEL = "Partager ma position avec l'organisateur";
export const LIVE_SHARING_CONSENT =
  "Partager ma position avec l'organisateur jusqu'à mon arrivée. Position approximative (environ 100 m), visible de l'organisateur seul, jamais conservée.";
export const LIVE_SHARING_ERROR = "Impossible d'activer le partage de position.";

export interface LiveSharingToggleProps {
  eventId: string;
  /** Statut du partage pour CET evenement ('idle' si un autre evenement partage). */
  status: LiveSharingStatus;
  lastStop: LiveSharingStop | null;
  onToggle: (enabled: boolean) => void;
}

export function LiveSharingToggle({
  eventId,
  status,
  lastStop,
  onToggle,
}: LiveSharingToggleProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const isOn = status === 'starting' || status === 'sharing';
  const isBusy = status === 'starting' || status === 'stopping';

  return (
    <View style={styles.container} testID={`live-sharing-${eventId}`}>
      <View style={styles.row}>
        <AppText style={styles.label}>{LIVE_SHARING_LABEL}</AppText>
        <Switch
          value={isOn}
          disabled={isBusy}
          onValueChange={onToggle}
          trackColor={{ false: theme.colors.lightGrey, true: theme.colors.primaryEco }}
          accessibilityLabel={LIVE_SHARING_LABEL}
          testID={`live-sharing-switch-${eventId}`}
        />
      </View>
      <AppText style={styles.consent}>{LIVE_SHARING_CONSENT}</AppText>
      {status === 'sharing' && (
        <View style={styles.activeRow} testID={`live-sharing-active-${eventId}`}>
          <View style={styles.dot} />
          <AppText style={styles.activeText}>Partage actif</AppText>
        </View>
      )}
      {status === 'error' && (
        <AppText style={styles.errorText} testID={`live-sharing-error-${eventId}`}>
          {LIVE_SHARING_ERROR}
        </AppText>
      )}
      {status === 'idle' && lastStop !== null && lastStop.eventId === eventId && (
        <AppText style={styles.consent} testID={`live-sharing-stopped-${eventId}`}>
          {LIVE_SHARING_STOP_MESSAGES[lastStop.reason]}
        </AppText>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.lightGrey,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.sm,
    },
    label: {
      flex: 1,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    consent: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    activeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.success,
    },
    activeText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    errorText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.danger,
    },
  });
