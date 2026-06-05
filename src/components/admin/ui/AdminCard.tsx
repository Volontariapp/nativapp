import React from 'react';
import { View, StyleSheet, type ViewProps } from 'react-native';
import { theme } from '@/shared/themes/theme';

export interface AdminCardProps extends ViewProps {
  children: React.ReactNode;
  noPadding?: boolean;
  hasBorder?: boolean;
}

export const AdminCard = ({
  children,
  style,
  noPadding = false,
  hasBorder = false,
  ...props
}: AdminCardProps): React.JSX.Element => {
  return (
    <View
      style={[
        styles.card,
        hasBorder && styles.border,
        noPadding ? styles.noPadding : styles.padding,
        style,
      ]}
      {...props}
    >
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
  border: {
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
  },
  padding: {
    padding: theme.spacing.lg,
  },
  noPadding: {
    padding: 0,
  },
});
