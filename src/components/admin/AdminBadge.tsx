import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface AdminBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
}

export const AdminBadge = ({ label, variant = 'default' }: AdminBadgeProps): React.JSX.Element => {
  const getColors = (): { bg: string; text: string } => {
    switch (variant) {
      case 'success':
        return { bg: '#e6f4ea', text: theme.colors.success };
      case 'warning':
        return { bg: '#fef7e0', text: theme.colors.warning };
      case 'error':
        return { bg: '#fce8e6', text: theme.colors.danger };
      case 'info':
        return { bg: '#e8f0fe', text: theme.colors.primarySocio };
      default:
        return { bg: theme.colors.lightGrey, text: theme.colors.grey };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <AppText style={[styles.label, { color: colors.text }]}>{label}</AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    textTransform: 'uppercase',
  },
});
