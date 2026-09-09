import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import type { PressableProps } from 'react-native';

import { useAppTheme } from '@/context/ThemeContext';
import { AppIcons } from '@/components/media/AppIcons';
import type { IconLibrary, IconButtonVariant } from '@/shared/types/components';

interface AppIconsButtonProps extends Omit<PressableProps, 'style'> {
  variant?: IconButtonVariant;
  icon?: string;
  size?: number;
  iconLibrary?: IconLibrary;
  iconColor?: string;
  top?: number;
}

export const AppIconsButton = ({
  variant = 'eco',
  icon,
  iconLibrary = 'Feather',
  iconColor,
  top = 0,
  size = 24,
  ...pressableProps
}: AppIconsButtonProps): ReactNode => {
  const { theme } = useAppTheme();
  const resolvedIconColor = iconColor ?? theme.colors.reversed;

  const backgroundColor =
    variant === 'eco'
      ? theme.colors.primaryEco
      : variant === 'socio'
        ? theme.colors.primarySocio
        : variant === 'danger'
          ? theme.colors.danger
          : variant === 'white'
            ? theme.colors.white
            : 'transparent';

  return (
    <Pressable
      {...pressableProps}
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
        <AppIcons
          icon={icon}
          iconLibrary={iconLibrary}
          size={size * 0.5}
          color={resolvedIconColor}
        />
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
