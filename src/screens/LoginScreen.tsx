import { View, StyleSheet } from "react-native";
import {AppButton} from "@/components/AppButton";
import React, {useContext} from "react";
import {AppText} from "@/components/AppText";
import {AuthContext} from "@/context/AuthContext";
import {theme} from "@/themes/theme";

export function LoginScreen(): React.JSX.Element {
    const { signIn } = useContext(AuthContext);
    return (
        <View style={styles.container}>
            <AppText> This is the login screen </AppText>
          <AppButton variant={"eco"} text="se connecter" onPress={() => { signIn() }}/>
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
