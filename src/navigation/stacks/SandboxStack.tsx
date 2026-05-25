import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { SandBoxScreen } from '@/screens';

const Stack = createNativeStackNavigator();

export default function SandboxStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Sandbox" component={SandBoxScreen} />
    </Stack.Navigator>
  );
}
