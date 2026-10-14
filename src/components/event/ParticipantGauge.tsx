import React from 'react';
import { View, StyleSheet, type ViewStyle, type DimensionValue } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface ParticipantGaugeProps {
  current: number;
  max: number;
  style?: ViewStyle;
  testID?: string;
}

export function ParticipantGauge({
  current,
  max,
  style,
  testID = 'participant-gauge',
}: ParticipantGaugeProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const safeMax = Math.max(1, max);
  const safeCurrent = Math.max(0, current);
  const ratio = Math.min(1, safeCurrent / safeMax);
  const percentage = Math.round(ratio * 100);
  const remaining = Math.max(0, safeMax - safeCurrent);
  const isFull = safeCurrent >= safeMax;

  const barColor = isFull
    ? theme.colors.danger
    : ratio >= 0.8
      ? theme.colors.warning
      : theme.colors.primaryEco;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Feather name="users" size={16} color={theme.colors.primaryEco} />
          <AppText style={styles.title}>Inscriptions & Capacité</AppText>
        </View>

        <View
          style={[
            styles.statusPill,
            {
              backgroundColor: isFull
                ? theme.colors.badgeRedBackground
                : theme.colors.badgeEcoBackground,
            },
          ]}
        >
          <AppText
            style={[
              styles.statusPillText,
              {
                color: isFull ? theme.colors.danger : theme.colors.primaryEco,
              },
            ]}
          >
            {isFull ? 'Complet' : `${String(remaining)} place${remaining > 1 ? 's' : ''} dispo`}
          </AppText>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${String(percentage)}%` as DimensionValue,
              backgroundColor: barColor,
            },
          ]}
          testID="participant-gauge-bar"
        />
      </View>

      <View style={styles.footerRow}>
        <AppText style={styles.countText}>
          <AppText style={styles.currentCount}>{safeCurrent}</AppText> / {safeMax} bénévoles inscrits
        </AppText>

        <AppText style={styles.percentText}>{percentage}%</AppText>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.separator,
      ...theme.shadows.card,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    title: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.black,
    },
    statusPill: {
      paddingHorizontal: theme.spacing.sm + 2,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
    },
    statusPillText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
    },
    progressTrack: {
      height: 10,
      backgroundColor: theme.colors.background,
      borderRadius: theme.radius.full,
      overflow: 'hidden',
      marginBottom: theme.spacing.sm,
    },
    progressBar: {
      height: '100%',
      borderRadius: theme.radius.full,
    },
    footerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    countText: {
      fontSize: theme.typography.fontSize.xs,
      color: theme.colors.grey,
    },
    currentCount: {
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
    },
    percentText: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text,
    },
  });
