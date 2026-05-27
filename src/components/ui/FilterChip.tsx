import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface FilterChipProps {
  label: string;
  selected?: boolean;
  color?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * A pill-shaped filter chip. When `selected`, it shows a filled background.
 * `color` defaults to primarySocio. Works for any filter use-case.
 */
export const FilterChip = ({
  label,
  selected = false,
  color = theme.colors.primarySocio,
  onPress,
  style,
}: FilterChipProps): React.JSX.Element => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? color : color + '14',
          borderColor: color,
          opacity: pressed ? 0.75 : 1,
        },
        style,
      ]}
    >
      <AppText style={[styles.label, { color: selected ? theme.colors.white : color }]}>
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
