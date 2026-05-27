import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/native-tabs';
import Icon from 'react-native-vector-icons/Feather';

import AdminDashboardScreen from '../../screens/admin/dashboard/AdminDashboardScreen';
import AdminUsersScreen from '../../screens/admin/users/AdminUsersScreen';
import AdminEventsScreen from '../../screens/admin/events/AdminEventsScreen';
import AdminSystemScreen from '../../screens/admin/system/AdminSystemScreen';
import { AdminAppWrapper } from '../../components/admin/AdminAppWrapper';

const Tab = createBottomTabNavigator();

export default function AdminAppNavigator(): React.JSX.Element {
  return (
    <AdminAppWrapper>
      <Tab.Navigator
        screenOptions={{
          headerShown: true,
          tabBarActiveTintColor: '#1a73e8',
          tabBarInactiveTintColor: '#5f6368',
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            elevation: 8,
            shadowOpacity: 0.1,
            shadowRadius: 10,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={AdminDashboardScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="pie-chart" color={color} size={size} />,
            title: 'Aperçu',
          }}
        />
        <Tab.Screen
          name="Users"
          component={AdminUsersScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="users" color={color} size={size} />,
            title: 'Utilisateurs',
          }}
        />
        <Tab.Screen
          name="Events"
          component={AdminEventsScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="calendar" color={color} size={size} />,
            title: 'Événements',
          }}
        />
        <Tab.Screen
          name="System"
          component={AdminSystemScreen}
          options={{
            tabBarIcon: ({ color, size }) => <Icon name="server" color={color} size={size} />,
            title: 'Système',
          }}
        />
      </Tab.Navigator>
    </AdminAppWrapper>
  );
}
