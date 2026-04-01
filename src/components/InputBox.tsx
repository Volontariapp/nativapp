import React, {
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, TextInput, StyleSheet } from "react-native";
import { theme } from "@/themes/theme";
import { AppText } from "@/components/AppText";

export interface InputBoxRef {
  getValue: () => string;
  clear: () => void;
}

interface InputBoxProps {
  placeholder?: string;
  errorMessage?: string;
  label?: string;
  minLength?: number;
  maxLength?: number;
  disabled?: boolean;
}

export const InputBox = forwardRef<InputBoxRef, InputBoxProps>(
  ({ placeholder = "Entrez du texte...", errorMessage, label, maxLength, minLength, disabled}, ref) => {
    const [value, setValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    let isError = false;
    if (value.length != 0 && ((maxLength && value.length > maxLength) || (minLength && value.length < minLength)))
      isError = true;

    return (
      <View style={styles.container}>
        {label && (
          <AppText variant="caption" style={styles.label}>
            {label}
          </AppText>
        )}

        <TextInput
          value={value}
          onChangeText={setValue}
          placeholder={isFocused && !disabled ? "" : placeholder}
          placeholderTextColor={theme.colors.grey}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={!disabled}
          style={[
            styles.input,
            isError && styles.inputError,
            disabled && styles.inputDisabled, // ✅ style disabled
          ]}
        />

        {isError && (
          <AppText variant="caption" style={styles.errorText}>
            {errorMessage}
          </AppText>
        )}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: theme.spacing.xs,
  },

  label: {
    color: theme.colors.grey,
    fontSize: theme.typography.fontSize.sm,
  },

  input: {
    borderWidth: 1,
    borderColor: theme.colors.black,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.typography.fontSize.xs,
    paddingVertical: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fonts.primary,
    fontSize: theme.typography.fontSize.sm,
    backgroundColor: theme.colors.white,
  },

  inputError: {
    borderColor: theme.colors.danger,
  },

  inputDisabled: {
    backgroundColor: theme.colors.background,
    color: theme.colors.grey,
  },

  errorText: {
    color: theme.colors.danger,
  },
});
