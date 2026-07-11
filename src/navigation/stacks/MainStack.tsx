import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainAppNavigator from '../MainAppNavigator';
import { EventDetailScreen, SettingsScreen } from '@/screens';
import type { AppEvent } from '@/api/event/event.api';

export type MainStackParamList = {
  MainTabs: undefined;
  EventDetail: { event: AppEvent };
  Settings: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainAppNavigator} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
