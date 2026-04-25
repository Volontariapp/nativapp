import { View, StyleSheet } from "react-native";
import {AppButton} from "@/components/AppButton";
import {useRouter} from "expo-router";
import React from "react";
import {AppText} from "@/components/AppText";
import {theme} from "@/themes/theme";

const router = useRouter();

export function OnboardingScreen(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <AppText> This is the Register screen </AppText>
          <AppButton variant={"eco"} text="Go to homepage" onPress={() => { router.push("/"); }}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flex: 1,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xxl,
    },
    spacer: {
        height: theme.spacing.md,
    },
});
