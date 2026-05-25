import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { HomeScreen } from '@/screens';
import { SwipeScreen, ExploreScreen, CreateEventScreen } from '@/screens';
import ProfileStack from './stacks/ProfileStack';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppIcons } from '@/components/media/AppIcons';
import { theme } from '@/shared/themes/theme';
import { View } from 'react-native';

const Tab = createBottomTabNavigator();

export default function MainAppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen
        name="accueil"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarIcon: () => (
            <AppIcons
              icon="home"
              iconLibrary={'MaterialDesignIcons'}
              size={30}
              color={theme.colors.grey}
            />
          ),
        }}
      />

      <Tab.Screen
        name="swipe"
        component={SwipeScreen}
        options={{
          title: 'Swipe',
          tabBarIcon: () => (
            <AppIcons
              icon="cards"
              iconLibrary={'MaterialDesignIcons'}
              size={30}
              color={theme.colors.grey}
            />
          ),
        }}
      />

      <Tab.Screen
        name="create"
        component={CreateEventScreen}
        options={{
          title: 'Create',
          headerShown: false,
          tabBarButton: (props) => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <AppIconsButton
                icon="plus"
                size={60}
                top={-15}
                onPress={(e) => {
                  props.onPress?.(e);
                }}
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="explorer"
        component={ExploreScreen}
        options={{
          title: 'Explorer',
          tabBarIcon: () => <AppIcons icon="map" size={30} color={theme.colors.grey} />,
        }}
      />

      <Tab.Screen
        name="profil"
        component={ProfileStack}
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: () => (
            <AppIcons icon="person" iconLibrary={'Ionicons'} size={30} color={theme.colors.grey} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
