import { View, StyleSheet } from "react-native";

import React from "react";
import {AppText} from "@/components/AppText";
import AppHeader from "@/components/AppHeader";

export function ExploreScreen(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <AppHeader />
            <AppText> This is the Explore screen </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
});
