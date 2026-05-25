import React from 'react';

import AuthStack from './AuthStack';
import MainAppNavigator from './MainAppNavigator';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { AppText } from '@/components/AppText';

export default function RootNavigator(): React.JSX.Element {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <AppText>Loading...</AppText>
        <ActivityIndicator />
      </View>
    );
  }

  return isAuthenticated ? <MainAppNavigator /> : <AuthStack />;
}
