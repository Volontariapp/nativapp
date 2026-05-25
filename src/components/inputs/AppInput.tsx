import type { JSX } from 'react';
import { useState, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type NativeSyntheticEvent,
  type TargetedEvent,
} from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

export interface AppInputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  variant?: 'standard' | 'outlined';
  errorMessage?: string;
  validator?: (value: string) => string | null;
  value?: string;
  onChangeText?: (text: string) => void;
}

export const AppInput = ({
  label,
  variant = 'standard',
  errorMessage,
  validator,
  value,
  onChangeText,
  style,
  ...props
}: AppInputProps): JSX.Element => {
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const hasBlurred = useRef(false);

  const processTextChange = (text: string): void => {
    if (onChangeText) {
      onChangeText(text);
    }
    if (validator && hasBlurred.current) {
      setInternalError(validator(text));
    } else {
      setInternalError(null);
    }
  };

  const processBlur = (e: NativeSyntheticEvent<TargetedEvent>): void => {
    setIsFocused(false);
    hasBlurred.current = true;
    if (validator && value !== undefined) {
      setInternalError(validator(value));
    }
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const processFocus = (e: NativeSyntheticEvent<TargetedEvent>): void => {
    setIsFocused(true);
    if (props.onFocus) {
      props.onFocus(e);
    }
  };

  const displayError = errorMessage ?? internalError;
  const isError = displayError !== null && displayError !== '';

  if (variant === 'outlined') {
    return (
      <View style={styles.container}>
        {isError && <AppText style={styles.errorTextTop}>{displayError}</AppText>}
        <View
          style={[
            styles.outlinedWrapper,
            isFocused && styles.outlinedWrapperFocused,
            isError && styles.errorBorder,
          ]}
        >
          <View style={styles.outlinedLabelContainer}>
            <AppText
              style={[
                styles.outlinedLabel,
                isFocused && styles.outlinedLabelFocused,
                isError && styles.errorText,
              ]}
            >
              {label}
            </AppText>
          </View>
          <TextInput
            style={[styles.outlinedInput, style]}
            placeholderTextColor={theme.colors.grey}
            value={value}
            onChangeText={processTextChange}
            onBlur={processBlur}
            onFocus={processFocus}
            {...props}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isError && <AppText style={styles.errorTextTop}>{displayError}</AppText>}
      <AppText style={[styles.label, isError && styles.errorText]}>{label}</AppText>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          isError && styles.errorBorder,
          style,
        ]}
        placeholderTextColor={theme.colors.grey}
        value={value}
        onChangeText={processTextChange}
        onBlur={processBlur}
        onFocus={processFocus}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.lg,
  },
  errorTextTop: {
    color: theme.colors.danger,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
    fontWeight: '500',
  },
  errorText: {
    color: theme.colors.danger,
  },
  errorBorder: {
    borderColor: theme.colors.danger,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.black,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.grey + '40', // light grey border
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.black,
  },
  inputFocused: {
    borderColor: theme.colors.primaryEco,
  },
  outlinedWrapper: {
    borderWidth: 1.5,
    borderColor: theme.colors.grey,
    borderRadius: theme.radius.md,
    backgroundColor: 'transparent',
    marginTop: 8,
  },
  outlinedWrapperFocused: {
    borderColor: theme.colors.primaryEco,
  },
  outlinedLabelContainer: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: theme.colors.white,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  outlinedLabel: {
    fontSize: 12,
    color: theme.colors.grey,
    fontWeight: '500',
  },
  outlinedLabelFocused: {
    color: theme.colors.primaryEco,
    fontWeight: '700',
  },
  outlinedInput: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.black,
  },
});
