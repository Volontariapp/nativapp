import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { View, TextInput, StyleSheet } from 'react-native';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

export interface AppPillInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  centered?: boolean;
  returnKeyType?: 'search' | 'done' | 'go' | 'next';
  onSubmitEditing?: () => void;
}

export function AppPillInput({
  value,
  onChangeText,
  placeholder = 'Rechercher...',
  placeholderTextColor,
  style,
  inputStyle,
  centered = true,
  returnKeyType = 'search',
  onSubmitEditing,
}: AppPillInputProps): ReactNode {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={[
          styles.input,
          centered && styles.centeredInput,
          { color: theme.colors.text },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor ?? theme.colors.grey}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      flexShrink: 1,
      backgroundColor: theme.colors.white,
      borderWidth: 1.5,
      borderColor: theme.colors.black,
      borderRadius: theme.radius.full,
      height: 40,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    input: {
      fontSize: 14,
      paddingVertical: 0,
    },
    centeredInput: {
      textAlign: 'center',
    },
  });
