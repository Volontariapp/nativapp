// src/navigation/AdminNavigator.tsx
import React, { useState } from "react";
import { View, Button } from "react-native";

import RootNavigator from "./RootNavigator";
import SandboxStack from "@/navigation/SandboxStack";

export default function AdminNavigator(): React.JSX.Element {
  const [mode, setMode] = useState<"menu" | "app" | "sandbox">("menu");

  if (mode === "app") {
    return <RootNavigator />;
  }

  if (mode === "sandbox") {
    return <SandboxStack />;
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", gap: 20 }}>
      <Button title="🚀 Lancer App" onPress={():void => { setMode("app"); }} />
      <Button title="🧪 Sandbox" onPress={():void => { setMode("sandbox"); }} />
    </View>
  );
}
