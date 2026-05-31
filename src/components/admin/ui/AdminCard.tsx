import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { theme } from '@/shared/themes/theme';

interface AdminCardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
}

export const AdminCard = ({
  children,
  style,
  noPadding = false,
  ...props
}: AdminCardProps): React.JSX.Element => {
  return (
    <View style={[styles.card, noPadding ? styles.noPadding : styles.padding, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    ...theme.shadows.card,
    marginBottom: theme.spacing.lg,
  },
  padding: {
    padding: theme.spacing.lg,
  },
  noPadding: {
    padding: 0,
  },
});
