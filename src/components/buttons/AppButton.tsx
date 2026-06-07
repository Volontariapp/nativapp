import type { ReactNode } from 'react';
import { Text, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { BUTTON_VARIANTS } from '@/shared/themes/buttonVariants';
import { theme } from '@/shared/themes/theme';
import { AppIcons } from '@/components/media/AppIcons';
import type { IconLibrary, ButtonVariant } from '@/shared/types/components';

interface AppButtonProps {
  text: string;
  variant?: ButtonVariant;
  icon?: string;
  iconLibrary?: IconLibrary;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  size?: 'default' | 'small';
}

export const AppButton = ({
  text,
  variant = 'eco',
  icon,
  iconLibrary = 'Feather',
  onPress,
  disabled = false,
  style,
  size = 'default',
}: AppButtonProps): ReactNode => {
  const stylesVariant = BUTTON_VARIANTS[variant];
  const isSmall = size === 'small';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        isSmall && styles.buttonSmall,
        {
          backgroundColor: stylesVariant.backgroundColor,
          borderColor: stylesVariant.borderColor,
          borderWidth: 1,
          opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        {icon != null && (
          <AppIcons
            icon={icon}
            iconLibrary={iconLibrary}
            size={isSmall ? 16 : 20}
            color={stylesVariant.textColor}
          />
        )}
        <Text
          style={[
            styles.text,
            isSmall && styles.textSmall,
            {
              color: stylesVariant.textColor,
              fontFamily: theme.typography.fonts.primary,
            },
          ]}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
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
