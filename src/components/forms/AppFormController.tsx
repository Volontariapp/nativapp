import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
  type FieldErrors,
} from 'react-hook-form';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface AppFormControllerProps<T extends FieldValues, TName extends FieldPath<T> = FieldPath<T>> {
  control: Control<T>;
  name: TName;
  label?: string;
  errors?: FieldErrors<T>;
  render: React.ComponentProps<typeof Controller<T, TName>>['render'];
  containerStyle?: ViewStyle;
}

/**
 * A reusable form controller component that wraps react-hook-form's Controller
 * with a label and error message.
 */
export function AppFormController<
  T extends FieldValues,
  TName extends FieldPath<T> = FieldPath<T>,
>({
  control,
  name,
  label,
  errors,
  render,
  containerStyle,
}: AppFormControllerProps<T, TName>): React.JSX.Element {
  // Extract error for this specific field
  // Deeply nested errors are handled by react-hook-form's FieldErrors type
  const error = errors?.[name] as { message?: string } | undefined;

  return (
    <View style={[styles.inputGroup, containerStyle]}>
      {label !== undefined && label !== '' && <AppText style={styles.label}>{label}</AppText>}
      <Controller control={control} name={name} render={render} />
      {error?.message !== undefined && error.message !== '' ? (
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
