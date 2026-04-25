// src/navigation/AuthStack.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import { LoginScreen }  from "@/screens/LoginScreen";
import { RegisterScreen }from "@/screens/RegisterScreen";
import { OnboardingScreen }  from "@/screens/OnboardingScreen";

const Stack = createNativeStackNavigator();

export default function AuthStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    </Stack.Navigator>
  );
}
