import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface AdminStatBadgeProps {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const AdminStatBadge = ({
  title,
  value,
  trend,
  trendValue,
}: AdminStatBadgeProps): React.JSX.Element => {
  return (
    <View style={styles.container}>
      <AppText style={styles.title}>{title}</AppText>
      <AppText style={styles.value}>{value}</AppText>
      {trend != null && trendValue != null && (
        <View style={[styles.trendContainer, styles[`trend_${trend}`]]}>
          <AppText style={[styles.trendText, styles[`trendText_${trend}`]]}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '−'} {trendValue}
          </AppText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    ...theme.shadows.card,
  },
  title: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.black,
    marginBottom: theme.spacing.xs,
  },
  trendContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginTop: theme.spacing.xs,
  },
  trendText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '600',
  },
  trend_up: {
    backgroundColor: theme.colors.success + '20',
  },
  trendText_up: {
    color: theme.colors.success,
  },
  trend_down: {
    backgroundColor: theme.colors.danger + '20',
  },
  trendText_down: {
    color: theme.colors.danger,
  },
  trend_neutral: {
    backgroundColor: theme.colors.lightGrey,
  },
  trendText_neutral: {
    color: theme.colors.grey,
  },
});
