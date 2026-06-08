import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import { NotificationProvider } from '@/context/NotificationContext';
import AdminNavigator from '@/navigation/AdminNavigator';
import { KeyboardProvider } from 'react-native-keyboard-controller';

const queryClient = new QueryClient();

export default function Layout(): React.JSX.Element {
  return (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SocketProvider>
            <NotificationProvider>
              <AdminNavigator />
            </NotificationProvider>
          </SocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </KeyboardProvider>
  );
}
