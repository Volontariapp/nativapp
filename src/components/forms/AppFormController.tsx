import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Controller, Control, FieldValues, Path, FieldPath, FieldErrors } from 'react-hook-form';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface AppFormControllerProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  errors?: FieldErrors<T>;
  render: React.ComponentProps<typeof Controller<T>>['render'];
  containerStyle?: ViewStyle;
}

/**
 * A reusable form controller component that wraps react-hook-form's Controller
 * with a label and error message.
 */
export function AppFormController<T extends FieldValues>({
  control,
  name,
  label,
  errors,
  render,
  containerStyle,
}: AppFormControllerProps<T>): React.JSX.Element {
  // Extract error for this specific field
  // Deeply nested errors are handled by react-hook-form's FieldErrors type
  const error = errors?.[name] as { message?: string } | undefined;

  return (
    <View style={[styles.inputGroup, containerStyle]}>
      {label && <AppText style={styles.label}>{label}</AppText>}
      <Controller
        control={control}
        name={name}
        render={render}
      />
      {error?.message ? (
        <AppText style={styles.errorText}>{error.message}</AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
});
