import { View, StyleSheet } from "react-native";

import React from "react";
import {AppText} from "@/components/AppText";
import AppHeader from "@/components/AppHeader";
import {theme} from "@/themes/theme";

export function SwipeScreen(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <AppHeader />
            <AppText> This is the Swipe screen </AppText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
});
