import React from 'react';

import AuthStack from './stacks/AuthStack';
import MainStack from './stacks/MainStack';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { AppText } from '@/components/typography/AppText';

export default function RootNavigator(): React.JSX.Element {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <AppText>Loading…</AppText>
        <ActivityIndicator />
      </View>
    );
  }

  return isAuthenticated ? <MainStack /> : <AuthStack />;
}
