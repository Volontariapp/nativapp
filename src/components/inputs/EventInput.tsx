import React from 'react';
import { View, TextInput, StyleSheet, type TextInputProps } from 'react-native';
import { theme } from '@/shared/themes/theme';

export interface EventInputProps extends TextInputProps {
  containerStyle?: View['props']['style'];
}

/**
 * A specialized input for event details (title, location).
 * Features a white background, green border, and light green text.
 */
export const EventInput = ({
  style,
  containerStyle,
  ...props
}: EventInputProps): React.ReactNode => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={theme.colors.grey}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderWidth: 1.5,
    borderColor: theme.colors.primaryEco, // Green border
    borderRadius: theme.radius.lg, // More rounded as requested ("arrondis")
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.secondaryEco, // Light green text
    fontFamily: theme.typography.fonts.primary,
  },
});
