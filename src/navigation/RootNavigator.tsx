import React, { useContext } from "react";

import AuthStack from "./AuthStack";
import MainAppNavigator from "./MainAppNavigator";
import { AuthContext } from "@/context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import {AppText} from "@/components/AppText";

export default function RootNavigator(): React.JSX.Element {
  const { isLoading, userToken } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center" }}>
        <AppText>Loading...</AppText>
        <ActivityIndicator />
      </View>
    );
  }

  return (userToken != null) ? <MainAppNavigator /> : <AuthStack />;
}
