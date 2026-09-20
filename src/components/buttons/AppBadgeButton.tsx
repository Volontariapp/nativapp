import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { IconLibrary } from '@/shared/types/components';

export type BadgeButtonVariant = 'all' | 'eco' | 'socio' | 'white' | 'neutral' | 'outline';

export interface AppBadgeButtonProps {
  label: string;
  variant?: BadgeButtonVariant;
  selected?: boolean;
  bordered?: boolean;
  icon?: string;
  iconLibrary?: IconLibrary;
  iconSize?: number;
  iconColor?: string;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function AppBadgeButton({
  label,
  variant = 'neutral',
  selected = false,
  bordered = false,
  icon,
  iconLibrary = 'Feather',
  iconSize = 13,
  iconColor,
  onPress,
  disabled = false,
  accessibilityLabel,
  style,
  textStyle,
}: AppBadgeButtonProps): ReactNode {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  const getVariantStyles = () => {
    switch (variant) {
      case 'all':
        return {
          backgroundColor: `${theme.colors.primarySocio}18`,
          textColor: theme.colors.primarySocio,
          borderColor: selected
            ? theme.colors.black
            : bordered
              ? theme.colors.black
              : `${theme.colors.primarySocio}40`,
        };
      case 'eco':
        return {
          backgroundColor: `${theme.colors.primaryEco}20`,
          textColor: theme.colors.primaryEco,
          borderColor: selected
            ? theme.colors.black
            : bordered
              ? theme.colors.black
              : `${theme.colors.primaryEco}40`,
        };
      case 'socio':
        return {
          backgroundColor: `${theme.colors.primarySocio}20`,
          textColor: theme.colors.primarySocio,
          borderColor: selected
            ? theme.colors.black
            : bordered
              ? theme.colors.black
              : `${theme.colors.primarySocio}40`,
        };
      case 'white':
        return {
          backgroundColor: theme.colors.white,
          textColor: theme.colors.text,
          borderColor: selected
            ? theme.colors.black
            : bordered
              ? theme.colors.black
              : theme.colors.lightGrey,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          textColor: theme.colors.text,
          borderColor: selected ? theme.colors.primaryEco : theme.colors.grey,
        };
      case 'neutral':
      default:
        return {
          backgroundColor: theme.colors.background,
          textColor: theme.colors.text,
          borderColor: selected
            ? theme.colors.black
            : bordered
              ? theme.colors.black
              : theme.colors.separator,
        };
    }
  };

  const { backgroundColor, textColor, borderColor } = getVariantStyles();
  const resolvedIconColor = iconColor ?? textColor;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: selected ? 2 : bordered ? 1.5 : 1,
          opacity: disabled ? 0.5 : pressed ? 0.75 : 1,
        },
        selected && styles.selectedShadow,
        style,
      ]}
    >
      {icon != null && (
        <AppIcons
          icon={icon}
          iconLibrary={iconLibrary}
          size={iconSize}
          color={resolvedIconColor}
        />
      )}
      <AppText
        style={[
          styles.text,
          {
            color: textColor,
            fontWeight: selected || bordered ? '700' : '600',
          },
          textStyle,
        ]}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.full,
      paddingHorizontal: 14,
      paddingVertical: 5,
      gap: 6,
    },
    selectedShadow: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
    },
    text: {
      fontSize: 12.5,
    },
  });
