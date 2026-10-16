import React from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Feather';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

const ICON_RATIO = 0.55;

interface UserAvatarProps {
  /** URL de la photo ; sans URL, un cercle neutre est affiché. */
  uri: string | undefined;
  size: number;
  /** Espacement et bordure imposés par le parent. */
  style?: StyleProp<ViewStyle>;
}

/** Avatar rond d'un utilisateur : sa photo, ou un cercle neutre quand il n'en a pas. */
export const UserAvatar = ({ uri, size, style }: UserAvatarProps): React.JSX.Element => {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const circle = { width: size, height: size, borderRadius: size / 2 };

  return (
    <View testID="user-avatar" style={[styles.container, circle, style]}>
      {uri !== undefined && uri !== '' ? (
        <Image
          testID="user-avatar-image"
          source={{ uri }}
          style={styles.image}
          contentFit="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <View testID="user-avatar-placeholder" style={styles.placeholder}>
          <Icon name="user" size={Math.round(size * ICON_RATIO)} color={theme.colors.grey} />
        </View>
      )}
    </View>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      overflow: 'hidden',
      backgroundColor: theme.colors.lightGrey,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
