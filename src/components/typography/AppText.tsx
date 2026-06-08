import React from 'react';
import type { TextProps } from 'react-native';
import { Text, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import type { AppTextVariant, FontType } from '@/shared/types/components';

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?: AppTextVariant;
  font?: FontType;
}

export const AppText = ({
  children,
  variant = 'body',
  font = 'primary',
  style,
  ...props
}: AppTextProps): React.ReactNode => {
  return (
    <Text
      style={[styles.base, styles[variant], { fontFamily: theme.typography.fonts[font] }, style]}
      {...props}
    >
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  base: {
    color: theme.colors.black,
  },

  title: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  bigTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.grey,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  body: {
    fontSize: 14,
  },

  caption: {
    fontSize: 12,
    color: theme.colors.grey,
  },
});
