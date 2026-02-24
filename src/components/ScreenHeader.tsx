import { View, Text, StyleSheet } from "react-native";

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
}

export function ScreenHeader({
    title,
    subtitle,
}: ScreenHeaderProps): React.JSX.Element {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        paddingTop: 60,
        paddingBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#1a1a2e",
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: "#6c6c80",
        marginTop: 4,
    },
});
