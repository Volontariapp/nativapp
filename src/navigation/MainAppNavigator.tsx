import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LiquidTabBar } from './components/LiquidTabBar';

import { HomeScreen } from '@/screens';
import { SwipeScreen, ExploreScreen } from '@/screens';
import ProfileStack from './stacks/ProfileStack';
import CreateEventStack from './stacks/CreateEventStack';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppIcons } from '@/components/media/AppIcons';
import { View, Platform } from 'react-native';
import { theme } from '@/shared/themes/theme';

const Tab = createBottomTabNavigator();

export default function MainAppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: theme.colors.text,
        tabBarInactiveTintColor: theme.colors.grey,
      }}
      tabBar={Platform.OS === 'ios' ? (props) => <LiquidTabBar {...props} /> : undefined}
    >
      <Tab.Screen
        name="accueil"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AppIcons
              icon={focused ? 'home' : 'home-outline'}
              iconLibrary={'MaterialDesignIcons'}
              size={30}
              color={focused ? theme.colors.text : theme.colors.grey}
            />
          ),
        }}
      />

      <Tab.Screen
        name="swipe"
        component={SwipeScreen}
        options={{
          title: 'Swipe',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AppIcons
              icon={focused ? 'cards' : 'cards-outline'}
              iconLibrary={'MaterialDesignIcons'}
              size={30}
              color={focused ? theme.colors.text : theme.colors.grey}
            />
          ),
        }}
      />

      <Tab.Screen
        name="create"
        component={CreateEventStack}
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
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AppIcons
              icon={focused ? 'map' : 'map-outline'}
              iconLibrary={'MaterialDesignIcons'}
              size={30}
              color={focused ? theme.colors.text : theme.colors.grey}
            />
          ),
        }}
      />

      <Tab.Screen
        name="profil"
        component={ProfileStack}
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <AppIcons
              icon={focused ? 'person' : 'person-outline'}
              iconLibrary={'Ionicons'}
              size={30}
              color={focused ? theme.colors.text : theme.colors.grey}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
