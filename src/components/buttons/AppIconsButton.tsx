import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ICONS_BUTTON_VARIANTS } from '@/shared/themes/buttonVariants';
import { theme } from '@/shared/themes/theme';
import { AppIcons } from '@/components/media/AppIcons';
import type { GestureResponderEvent } from 'react-native';
import type { IconLibrary, IconButtonVariant } from '@/shared/types/components';

interface AppIconsButtonProps {
  variant?: IconButtonVariant;
  icon?: string;
  size?: number;
  iconLibrary?: IconLibrary;
  iconColor?: string;
  top?: number;
  onPress?: (event: GestureResponderEvent) => void;
}

export const AppIconsButton = ({
  variant = 'eco',
  icon,
  iconLibrary = 'Feather',
  iconColor = theme.colors.white,
  top = 0,
  onPress,
  size = 24,
}: AppIconsButtonProps): ReactNode => {
  const stylesVariant = ICONS_BUTTON_VARIANTS[variant];

  const backgroundColor =
    stylesVariant !== ICONS_BUTTON_VARIANTS.noBackground
      ? stylesVariant.backgroundColor
      : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          top: top,
          width: size,
          height: size,
          borderRadius: theme.radius.full,
          backgroundColor,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {icon != null && (
        <AppIcons icon={icon} iconLibrary={iconLibrary} size={size * 0.5} color={iconColor} />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
