import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import React from 'react';

import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

export type AuthStackParamList = {
  login: undefined;
  register: undefined;
  onboarding: undefined;
};

export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: true }}>
      <Stack.Screen
        name="onboarding"
        component={OnboardingScreen}
        options={{ title: 'Bienvenue', headerShown: false }}
      />
      <Stack.Screen name="login" component={LoginScreen} options={{ title: 'Page de connexion' }} />
      <Stack.Screen name="register" component={RegisterScreen} options={{ title: 'Inscription' }} />
    </Stack.Navigator>
  );
}
