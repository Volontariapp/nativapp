import React from 'react';
import { View, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import { AppText } from '@/components/typography/AppText';
import { useSocket } from '@/context/SocketContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader(): React.JSX.Element {
  const { isConnected } = useSocket();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <AppText style={styles.title}>VolontariApp</AppText>
      <View
        style={[
          styles.statusDot,
          { backgroundColor: isConnected ? theme.colors.success : theme.colors.danger },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.black,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 6,
  },
});
