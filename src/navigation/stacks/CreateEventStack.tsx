import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ManageEventsScreen, EventFormScreen, MyEventsScreen } from '@/screens';
import { PostFormScreen } from '@/screens/post/PostFormScreen';
import { MyPostsScreen } from '@/screens/post/MyPostsScreen';

export type CreateEventStackParamList = {
  ManageEvents: undefined;
  EventForm: undefined;
  MyEvents: undefined;
  PostForm: undefined;
  MyPosts: undefined;
};

const Stack = createNativeStackNavigator<CreateEventStackParamList>();

export default function CreateEventStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="EventForm" component={EventFormScreen} />
      <Stack.Screen name="MyEvents" component={MyEventsScreen} />
      <Stack.Screen name="PostForm" component={PostFormScreen} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} />
    </Stack.Navigator>
  );
}
