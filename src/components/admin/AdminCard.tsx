import React from 'react';
import { View, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';
import { theme } from '@/shared/themes/theme';

interface AdminCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const AdminCard = ({ children, style, ...props }: AdminCardProps): React.JSX.Element => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.lightGrey,
  },
});
