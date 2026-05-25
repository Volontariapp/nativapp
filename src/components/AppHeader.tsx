// src/components/AppHeader.tsx

import { View, Text } from 'react-native';
import React from 'react';
import { theme } from '@/themes/theme';
import { useSocket } from '@/context/SocketContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AppHeader(): React.JSX.Element {
  const { isConnected } = useSocket();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        backgroundColor: theme.colors.background,
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
        paddingTop: insets.top,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>VolontariApp</Text>
      <View
        style={{
          width: 10,
          height: 10,
          borderRadius: 5,
          backgroundColor: isConnected ? theme.colors.success : theme.colors.danger,
          marginBottom: 6,
        }}
      />
    </View>
  );
}
