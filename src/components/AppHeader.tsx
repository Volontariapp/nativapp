// src/components/AppHeader.tsx

import {View, Text} from "react-native";
import React from "react";

export default function AppHeader(): React.JSX.Element  {
  return (
      <View
        style={{
          height: 50,
          backgroundColor: "#F5EDE2",
          justifyContent: "flex-end",
          paddingHorizontal: 16,
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>
          VolontariApp
        </Text>
      </View>
  );
}
