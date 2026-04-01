import { View, Text, StyleSheet } from "react-native";
import {theme} from "@/themes/theme";

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
            {subtitle !== undefined && subtitle !== "" && (
                <Text style={styles.subtitle}>{subtitle}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.md,
        paddingBottom: theme.spacing.xs,
    },
    title: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.bold,
        color: theme.colors.background,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: theme.typography.fontSize.md,
        color: theme.colors.grey,
        marginTop: theme.spacing.xs,
    },
});
