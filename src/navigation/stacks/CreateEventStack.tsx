import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ManageEventsScreen,
  ManageHubScreen,
  EventFormScreen,
  MyEventsScreen,
  EventManagementScreen,
} from '@/screens';
import { PostFormScreen } from '@/screens/post/PostFormScreen';
import { MyPostsScreen } from '@/screens/post/MyPostsScreen';
import type { AppEvent } from '@/api/event/event.api';

export type CreateEventStackParamList = {
  ManageEvents: undefined;
  ManageHub: undefined;
  EventForm: undefined;
  MyEvents: undefined;
  EventManagement: { eventId: string; initialEvent?: AppEvent };
  PostForm: undefined;
  MyPosts: undefined;
};

const Stack = createNativeStackNavigator<CreateEventStackParamList>();

export default function CreateEventStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="ManageHub" component={ManageHubScreen} />
      <Stack.Screen name="EventForm" component={EventFormScreen} />
      <Stack.Screen name="MyEvents" component={MyEventsScreen} />
      <Stack.Screen name="EventManagement" component={EventManagementScreen} />
      <Stack.Screen name="PostForm" component={PostFormScreen} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} />
    </Stack.Navigator>
  );
}
