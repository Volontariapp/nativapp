import type { JSX } from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import { BUTTON_VARIANTS } from '@/themes/buttonVariants';
import { theme } from '@/themes/theme';
import { AppIcons } from '@/components/media/AppIcons';
import type { IconLibrary, ButtonVariant } from '@/types/components';

interface AppButtonProps {
  text: string;
  variant?: ButtonVariant;
  icon?: string;
  iconLibrary?: IconLibrary;
  onPress?: () => void;
  disabled?: boolean;
}

export const AppButton = ({
  text,
  variant = 'eco',
  icon,
  iconLibrary = 'Feather',
  onPress,
  disabled = false,
}: AppButtonProps): JSX.Element => {
  const stylesVariant = BUTTON_VARIANTS[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: stylesVariant.backgroundColor,
          borderColor: stylesVariant.borderColor,
          borderWidth: 1,
          opacity: disabled ? 0.6 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {icon != null && (
          <AppIcons
            icon={icon}
            iconLibrary={iconLibrary}
            size={20}
            color={stylesVariant.textColor}
          />
        )}
        <Text
          style={[
            styles.text,
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

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },

  text: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});
