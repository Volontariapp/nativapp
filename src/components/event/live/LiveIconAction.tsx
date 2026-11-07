import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { IconLibrary } from '@/shared/types/components';

export interface LiveIconActionProps {
  icon: string;
  iconLibrary?: IconLibrary;
  /** Libelle lu par les lecteurs d'ecran : l'icone seule n'a pas de texte. */
  accessibilityLabel: string;
  onPress: () => void;
  testID?: string;
}

const ICON_SIZE = 20;

/** Bouton rond a icone seule (trajet, detail). */
export function LiveIconAction({
  icon,
  iconLibrary,
  accessibilityLabel,
  onPress,
  testID,
}: LiveIconActionProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      <AppIcons
        icon={icon}
        iconLibrary={iconLibrary}
        size={ICON_SIZE}
        color={theme.colors.primarySocio}
      />
    </Pressable>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    button: {
      width: 40,
      height: 40,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.badgeSocioBackground,
    },
    pressed: {
      opacity: 0.7,
    },
  });
