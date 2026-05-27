import React, { useState } from 'react';
import { TextInput, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Feather';
import { theme } from '@/shared/themes/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Rechercher…',
  style,
}: SearchBarProps): React.JSX.Element => {
  const [isFocused, setIsFocused] = useState(false);
  const focusProgress = useSharedValue(0);

  const animatedBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusProgress.value,
      [0, 1],
      [theme.colors.lightGrey, theme.colors.primarySocio],
    ),
  }));

  const activateFocusRing = (): void => {
    setIsFocused(true);
    focusProgress.value = withTiming(1, { duration: 180 });
  };

  const deactivateFocusRing = (): void => {
    setIsFocused(false);
    focusProgress.value = withTiming(0, { duration: 180 });
  };

  const clearSearch = (): void => {
    onChangeText('');
  };

  return (
    <Animated.View style={[styles.container, animatedBorderStyle, style]}>
      <Icon
        name="search"
        size={16}
        color={isFocused ? theme.colors.primarySocio : theme.colors.grey}
        style={styles.icon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.grey}
        autoCapitalize="none"
        autoCorrect={false}
        onFocus={activateFocusRing}
        onBlur={deactivateFocusRing}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={clearSearch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="x-circle" size={16} color={theme.colors.grey} />
        </Pressable>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
    boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
  },
  icon: {
    flexShrink: 0,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.black,
    padding: 0,
  },
});
