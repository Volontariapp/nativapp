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
 * A pill-shaped filter chip. When `selected`, it shows a filled background with white text.
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
          backgroundColor: selected ? color : 'transparent',
          borderColor: color,
          borderWidth: selected ? 2 : 1.5,
          opacity: pressed ? 0.75 : 1,
        },
        selected && {
          shadowColor: color,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: 3,
        },
        style,
      ]}
    >
      <AppText
        style={[
          styles.label,
          {
            color: selected ? theme.colors.white : color,
            fontWeight: selected ? '700' : '600',
          },
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    letterSpacing: 0.2,
  },
});
