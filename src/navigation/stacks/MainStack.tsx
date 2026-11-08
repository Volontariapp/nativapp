import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainAppNavigator from '../MainAppNavigator';
import {
  EventDetailScreen,
  SettingsScreen,
  RanksScreen,
  BadgesScreen,
  LeaderboardScreen,
  PublicProfileScreen,
  StorageDebugScreen,
  EventManagementScreen,
  LiveEventScreen,
} from '@/screens';
import type { AppEvent } from '@/api/event/event.api';
import type { ManageTabType } from '@/screens/event/manage-hub.utils';

export type MainStackParamList = {
  MainTabs:
    | { screen: string; params?: { screen: string; params?: { initialTab?: ManageTabType } } }
    | undefined;
  EventDetail: { event: AppEvent };
  Settings: undefined;
  Ranks: undefined;
  Badges: undefined;
  Leaderboard: undefined;
  PublicProfile: { userId: string };
  StorageDebug: undefined;
  EventManagement: { eventId: string; initialEvent?: AppEvent };
  LiveEvent: undefined;
};

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainAppNavigator} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Ranks" component={RanksScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Stack.Screen name="PublicProfile" component={PublicProfileScreen} />
      <Stack.Screen name="StorageDebug" component={StorageDebugScreen} />
      <Stack.Screen name="EventManagement" component={EventManagementScreen} />
      <Stack.Screen name="LiveEvent" component={LiveEventScreen} />
    </Stack.Navigator>
  );
}
