import type { ReactNode } from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { BUTTON_VARIANTS } from '@/shared/themes/buttonVariants';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { AppIcons } from '@/components/media/AppIcons';
import type { IconLibrary, ButtonVariant } from '@/shared/types/components';

interface AppButtonProps {
  text: string;
  variant?: ButtonVariant;
  icon?: string;
  iconLibrary?: IconLibrary;
  onPress?: () => void;
  disabled?: boolean;
  /** Remplace l'icône par un spinner et ignore les appuis (action en cours déclenchée par ce bouton). */
  loading?: boolean;
  testID?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'default' | 'small';
}

export const AppButton = ({
  text,
  variant = 'eco',
  icon,
  iconLibrary = 'Feather',
  onPress,
  disabled = false,
  loading = false,
  testID,
  style,
  textStyle,
  size = 'default',
}: AppButtonProps): ReactNode => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const stylesVariant = BUTTON_VARIANTS[variant];
  const isSmall = size === 'small';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityState={loading ? { busy: true, disabled: true } : undefined}
      style={({ pressed }) => [
        styles.button,
        isSmall && styles.buttonSmall,
        {
          backgroundColor: stylesVariant.backgroundColor,
          borderColor: stylesVariant.borderColor,
          borderWidth: 1,
          opacity: isDisabled ? 0.6 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            testID="app-button-spinner"
            size="small"
            color={stylesVariant.textColor}
          />
        ) : (
          icon != null && (
            <AppIcons
              icon={icon}
              iconLibrary={iconLibrary}
              size={isSmall ? 16 : 20}
              color={stylesVariant.textColor}
            />
          )
        )}
        <Text
          style={[
            styles.text,
            isSmall && styles.textSmall,
            {
              color: stylesVariant.textColor,
              fontFamily: theme.typography.fonts.primary,
            },
            textStyle,
          ]}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      borderRadius: theme.radius.md,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonSmall: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.sm,
    },

    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },

    text: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.semibold,
    },

    textSmall: {
      fontSize: theme.typography.fontSize.xs,
    },
  });
