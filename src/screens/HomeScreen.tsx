import { View, StyleSheet } from "react-native";
import { ScreenHeader } from "@/components";
import {AppButton} from "@/components/AppButton";
import {useRouter} from "expo-router";

const router = useRouter();

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function HomeScreen() {
    return (
        <View style={styles.container}>
            <ScreenHeader
                title="Volontariapp"
                subtitle="Connect. Volunteer. Impact."
            />
            <View style={styles.content}>
                <AppButton
                    icon={"hammer"}
                    iconLibrary={"FontAwesome5"}
                    text="Go to sandbox"
                    onPress={() => { router.push("/SandBox"); }}
                />
                <View style={styles.spacer} />
                <AppButton
                    text="Site Map"
                    variant={"secondary"}
                    onPress={() => { router.push("/_sitemap"); }}
                />
            </View>
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
