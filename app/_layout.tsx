import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import AdminNavigator from '@/navigation/AdminNavigator';

const queryClient = new QueryClient();

export default function Layout(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <AdminNavigator />
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
