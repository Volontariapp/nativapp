// src/components/AppHeader.tsx

import {View, Text} from "react-native";
import React from "react";
import {theme} from "@/themes/theme";

export default function AppHeader(): React.JSX.Element  {
  return (
      <View
        style={{
          height: 50,
          backgroundColor: theme.colors.background,
          justifyContent: "flex-end",
          paddingHorizontal: theme.spacing.lg,
          paddingBottom: theme.spacing.sm,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          VolontariApp
        </Text>
      </View>
  );
}
