import React from 'react';
import { StyleSheet, View } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { getStatusSectionStyle } from './event-status-section.utils';

interface EventStatusSectionHeaderProps {
  /** Libellé du statut, par exemple « À venir ». */
  title: string;
  count: number;
}

export function EventStatusSectionHeader({
  title,
  count,
}: EventStatusSectionHeaderProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { icon, color } = getStatusSectionStyle(title, theme);

  return (
    <View style={styles.container} testID="event-status-section-header">
      <View style={[styles.iconBadge, { backgroundColor: `${color}20` }]}>
        <Feather name={icon} size={16} color={color} />
      </View>
      <AppText style={[styles.title, { color }]}>{title}</AppText>
      <View style={[styles.count, { backgroundColor: `${color}20` }]}>
        <AppText style={[styles.countText, { color }]}>{String(count)}</AppText>
      </View>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.sm,
    },
    iconBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    count: {
      minWidth: 24,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.radius.full,
      alignItems: 'center',
    },
    countText: {
      fontSize: 12,
      fontWeight: '600',
    },
  });
