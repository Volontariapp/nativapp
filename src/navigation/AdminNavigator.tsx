import React, { useState, useMemo, useCallback } from 'react';
import { View, Button } from 'react-native';

import RootNavigator from './RootNavigator';
import SandboxStack from '@/navigation/stacks/SandboxStack';
import AdminAppNavigator from '@/navigation/admin/AdminAppNavigator';

import { AdminContext } from '@/context/admin/admin.context';
import { config } from '@/shared/config/base-config';
import type { AdminMode } from './resolve-admin-mode';
import { resolveAllowedAdminMode, resolveInitialAdminMode } from './resolve-admin-mode';

const ADMIN_MODE_ENV = { isDev: __DEV__, appEnv: config.nodeEnv };

export default function AdminNavigator(): React.JSX.Element {
  const [mode, setModeState] = useState<AdminMode>(() => resolveInitialAdminMode(ADMIN_MODE_ENV));

  const setMode = useCallback((requested: AdminMode): void => {
    setModeState(resolveAllowedAdminMode(requested, ADMIN_MODE_ENV));
  }, []);

  const adminContextValue = useMemo(() => ({ setMode }), [setMode]);

  return (
    <AdminContext.Provider value={adminContextValue}>
      {mode === 'app' && <RootNavigator />}
      {mode === 'sandbox' && <SandboxStack />}
      {mode === 'panel' && <AdminAppNavigator />}
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
          <Button
            title="⚙️ Super Admin Panel"
            onPress={(): void => {
              setMode('panel');
            }}
          />
        </View>
      )}
    </AdminContext.Provider>
  );
}
