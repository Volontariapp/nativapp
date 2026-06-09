import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import { theme } from '@/shared/themes/theme';

interface AppCloseButtonProps {
  onPress: () => void;
  size?: number;
}

export const AppCloseButton = ({ onPress, size = 24 }: AppCloseButtonProps): React.JSX.Element => {
  const containerSize = size * 1.5;
  const iconSize = size;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          width: containerSize,
          height: containerSize,
          borderRadius: containerSize / 2,
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <Feather name="x" size={iconSize} color={theme.colors.danger} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.danger,
    backgroundColor: 'transparent',
  },
});
