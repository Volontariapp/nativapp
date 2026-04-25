// src/navigation/MainAppNavigator.tsx
import React from "react";
import {createBottomTabNavigator} from "@react-navigation/bottom-tabs";

import {HomeScreen} from "@/screens";
import {SwipeScreen} from "@/screens/SwipeScreen";
import {ExploreScreen} from "@/screens/ExploreScreen";
import {ProfileScreen} from "@/screens/ProfileScreen";
import {AppIconsButton} from "@/components/AppIconsButton";
import {AppIcons} from "@/components/AppIcons";
import {theme} from "@/themes/theme";

const Tab = createBottomTabNavigator();

export default function MainAppNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Accueil" component={HomeScreen} options={{
        tabBarIcon: () => (
          <AppIcons icon="home" iconLibrary={"MaterialDesignIcons"} size={30} color={theme.colors.grey}/>
        )
      }}/>

      <Tab.Screen name="Swipe" component={SwipeScreen} options={{
        tabBarIcon: () => (
          <AppIcons icon="cards" iconLibrary={"MaterialDesignIcons"} size={30} color={theme.colors.grey}/>
        )
      }}/>

      <Tab.Screen
        name="Create"
        component={SwipeScreen}
        options={{
          tabBarButton: () => (
              <AppIconsButton icon="plus" size={60} top={-12}/>
          ),
        }}
      />

      <Tab.Screen name="Explorer" component={ExploreScreen} options={{
        tabBarIcon: () => (
          <AppIcons icon="map" size={30} color={theme.colors.grey}/>
        )
      }}/>

      <Tab.Screen name="Profil" component={ProfileScreen} options={{
        tabBarIcon: () => (
          <AppIcons icon="person" iconLibrary={"Ionicons"} size={30} color={theme.colors.grey}/>
        )
      }}/>
    </Tab.Navigator>
  );
}
