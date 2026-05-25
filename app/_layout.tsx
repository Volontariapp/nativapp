import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { SocketProvider } from '@/context/SocketContext';
import AdminNavigator from '@/navigation/AdminNavigator';

export default function Layout(): React.JSX.Element {
  return (
    <AuthProvider>
      <SocketProvider>
        <AdminNavigator />
      </SocketProvider>
    </AuthProvider>
  );
}
