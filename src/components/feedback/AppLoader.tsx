import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface AppLoaderProps {
  message?: string;
  fullScreen?: boolean;
  style?: ViewStyle;
}

export const AppLoader = ({
  message = 'Chargement en cours...',
  fullScreen = false,
  style,
}: AppLoaderProps): React.JSX.Element => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen, style]}>
      <ActivityIndicator size="large" color={theme.colors.primaryEco} />
      {message ? <AppText style={styles.message}>{message}</AppText> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: 14,
    color: theme.colors.grey,
    textAlign: 'center',
  },
});
