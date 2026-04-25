import { View, StyleSheet } from "react-native";
import {AppButton} from "@/components/AppButton";
import React from "react";
import {AppText} from "@/components/AppText";
import {AuthContext} from "@/context/AuthContext";
import {useContext} from "react";
import AppHeader from "@/components/AppHeader";
const { signOut } = useContext(AuthContext);


export function ProfileScreen(): React.JSX.Element {
    return (
        <View style={styles.container}>
            <AppHeader />
            <AppText> This is the Profile screen </AppText>
            <AppButton variant={"eco"} text="Se déconnecter" onPress={() => { signOut() }}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
    },
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
    },
    spacer: {
        height: 12,
    },
});
