import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { EventState } from '@volontariapp/contracts';
import { isEventDatePast, getEventStatusConfig } from './event-status.utils';

export interface EventStatusBadgeProps {
  state: EventState | number | string;
  endDate?: string | Date | null;
  startDate?: string | Date | null;
  date?: string | Date | null;
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function EventStatusBadge({
  state,
  endDate,
  startDate,
  date,
  size = 'md',
  style,
  testID = 'event-status-badge',
}: EventStatusBadgeProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const isPast = React.useMemo(
    () => isEventDatePast(endDate, startDate, date),
    [endDate, startDate, date],
  );

  const config = React.useMemo(
    () => getEventStatusConfig(state, isPast),
    [state, isPast],
  );

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  const iconSize = isSmall ? 12 : isLarge ? 16 : 14;
  const textColor = config.textColor(theme);
  const bgColor = config.bgColor(theme);
  const borderColor = config.borderColor(theme);

  return (
    <View
      style={[
        styles.badge,
        isSmall && styles.badgeSmall,
        isLarge && styles.badgeLarge,
        {
          backgroundColor: bgColor,
          borderColor,
        },
        style,
      ]}
      testID={testID}
      accessibilityRole="text"
      accessibilityLabel={`Statut : ${config.label}`}
    >
      <Feather name={config.icon} size={iconSize} color={textColor} style={styles.icon} />
      <AppText
        style={[
          styles.label,
          isSmall && styles.labelSmall,
          isLarge && styles.labelLarge,
          {
            color: textColor,
          },
        ]}
      >
        {config.label}
      </AppText>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.radius.full,
      borderWidth: 1,
    },
    badgeSmall: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    badgeLarge: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
    },
    icon: {
      marginRight: theme.spacing.xs,
    },
    label: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.semibold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    labelSmall: {
      fontSize: 10,
    },
    labelLarge: {
      fontSize: theme.typography.fontSize.sm,
    },
  });
