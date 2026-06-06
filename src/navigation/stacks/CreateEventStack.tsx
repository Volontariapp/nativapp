import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ManageEventsScreen, EventFormScreen, MyEventsScreen } from '@/screens';

export type CreateEventStackParamList = {
  ManageEvents: undefined;
  EventForm: undefined;
  MyEvents: undefined;
};

const Stack = createNativeStackNavigator<CreateEventStackParamList>();

export default function CreateEventStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="EventForm" component={EventFormScreen} />
      <Stack.Screen name="MyEvents" component={MyEventsScreen} />
    </Stack.Navigator>
  );
}
