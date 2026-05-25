import React, { useState, useMemo } from 'react';
import { View, Button } from 'react-native';

import RootNavigator from './RootNavigator';
import SandboxStack from '@/navigation/stacks/SandboxStack';

import { AdminContext } from '@/context/admin/admin.context';

export default function AdminNavigator(): React.JSX.Element {
  const [mode, setMode] = useState<'menu' | 'app' | 'sandbox'>('menu');

  const adminContextValue = useMemo(() => ({ setMode }), [setMode]);

  return (
    <AdminContext.Provider value={adminContextValue}>
      {mode === 'app' && <RootNavigator />}
      {mode === 'sandbox' && <SandboxStack />}
      {mode === 'menu' && (
        <View style={{ flex: 1, justifyContent: 'center', gap: 20 }}>
          <Button
            title="🚀 Lancer App"
            onPress={(): void => {
              setMode('app');
            }}
          />
          <Button
            title="🧪 Sandbox"
            onPress={(): void => {
              setMode('sandbox');
            }}
          />
        </View>
      )}
    </AdminContext.Provider>
  );
}
