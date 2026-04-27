// src/navigation/AuthStack.tsx
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import {SandBoxScreen} from "@/screens/SandBox";

const Stack = createNativeStackNavigator();

export default function SandboxStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Sandbox" component={SandBoxScreen} />
    </Stack.Navigator>
  );
}
