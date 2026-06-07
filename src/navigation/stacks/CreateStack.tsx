import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  CreateMenuScreen,
  ManageEventsScreen,
  EventFormScreen,
  MyEventsScreen,
  ManagePostsScreen,
  PostFormScreen,
  MyPostsScreen,
} from '@/screens';

export type CreateStackParamList = {
  CreateMenu: undefined;
  ManageEvents: undefined;
  EventForm: undefined;
  MyEvents: undefined;
  ManagePosts: undefined;
  PostForm: undefined;
  MyPosts: undefined;
};

const Stack = createNativeStackNavigator<CreateStackParamList>();

export default function CreateStack(): React.JSX.Element {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateMenu" component={CreateMenuScreen} />
      <Stack.Screen name="ManageEvents" component={ManageEventsScreen} />
      <Stack.Screen name="EventForm" component={EventFormScreen} />
      <Stack.Screen name="MyEvents" component={MyEventsScreen} />
      <Stack.Screen name="ManagePosts" component={ManagePostsScreen} />
      <Stack.Screen name="PostForm" component={PostFormScreen} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} />
    </Stack.Navigator>
  );
}
