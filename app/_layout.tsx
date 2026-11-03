import React, { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/shared/lib/query-client';
import { setupQueryManagers } from '@/shared/lib/setup-query-managers';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { DebugProvider } from '@/context/DebugContext';
import { ThemeProvider } from '@/context/ThemeContext';
import AdminNavigator from '@/navigation/AdminNavigator';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const queryClient = createQueryClient();

export default function Layout(): React.JSX.Element {
  useEffect(() => setupQueryManagers(), []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <DebugProvider>
                <SocketProvider>
                  <NotificationProvider>
                    <AdminNavigator />
                  </NotificationProvider>
                </SocketProvider>
              </DebugProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
