import React, { useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { LiquidTabBar } from './components/LiquidTabBar';
import { QuickActionsModal } from './components/QuickActionsModal';

import { HomeScreen } from '@/screens';
import { SwipeScreen, ExploreScreen } from '@/screens';
import ProfileStack from './stacks/ProfileStack';
import CreateEventStack from './stacks/CreateEventStack';
import type { MainStackParamList } from './stacks/MainStack';
import { AppIconsButton } from '@/components/buttons/AppIconsButton';
import { AppIcons } from '@/components/media/AppIcons';
import { View, Platform } from 'react-native';
import { theme } from '@/shared/themes/theme';

const Tab = createBottomTabNavigator();

export default function MainAppNavigator(): React.JSX.Element {
  const [quickActionsVisible, setQuickActionsVisible] = useState(false);
  const navigation = useNavigation<NavigationProp<MainStackParamList>>();

  const handleSelectCreate = useCallback(() => {
    setQuickActionsVisible(false);
    navigation.navigate('MainTabs', { screen: 'create' });
  }, [navigation]);

  const handleSelectManage = useCallback(() => {
    setQuickActionsVisible(false);
    navigation.navigate('MainTabs', { screen: 'create' });
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: theme.colors.text,
          tabBarInactiveTintColor: theme.colors.tabIconInactive,
        }}
        tabBar={Platform.OS === 'ios' ? (props) => <LiquidTabBar {...props} /> : undefined}
      >
        <Tab.Screen
          name="accueil"
          component={HomeScreen}
          options={{
            title: 'Accueil',
            headerShown: false,
            tabBarIcon: ({ focused, color }) => (
              <AppIcons
                icon={focused ? 'home' : 'home-outline'}
                iconLibrary={'MaterialDesignIcons'}
                size={30}
                color={color}
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
            tabBarIcon: ({ focused, color }) => (
              <AppIcons
                icon={focused ? 'cards' : 'cards-outline'}
                iconLibrary={'MaterialDesignIcons'}
                size={30}
                color={color}
              />
            ),
          }}
        />

        <Tab.Screen
          name="create"
          component={CreateEventStack}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setQuickActionsVisible((prev) => !prev);
            },
          }}
          options={{
            title: 'Actions',
            headerShown: false,
            tabBarButton: (props) => (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <AppIconsButton
                  icon={quickActionsVisible ? 'chevron-down' : 'chevron-up'}
                  size={60}
                  top={-15}
                  accessibilityLabel="Ouvrir les actions rapides"
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
            tabBarIcon: ({ focused, color }) => (
              <AppIcons
                icon={focused ? 'map' : 'map-outline'}
                iconLibrary={'MaterialDesignIcons'}
                size={30}
                color={color}
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
            tabBarIcon: ({ focused, color }) => (
              <AppIcons
                icon={focused ? 'person' : 'person-outline'}
                iconLibrary={'Ionicons'}
                size={30}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>

      <QuickActionsModal
        visible={quickActionsVisible}
        onClose={() => {
          setQuickActionsVisible(false);
        }}
        onSelectCreate={handleSelectCreate}
        onSelectManage={handleSelectManage}
      />
    </View>
  );
}
