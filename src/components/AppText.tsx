import type {JSX} from "react";
import React from "react";
import type { TextProps } from "react-native";
import { Text, StyleSheet } from "react-native";
import { theme } from "@/themes/theme";

type Variant = "title" | "subtitle" | "body" | "caption" | "bigTitle";
type FontType = "primary" | "secondary";

interface AppTextProps extends TextProps {
  children: React.ReactNode;
  variant?: Variant;
  font?: FontType;
}

export const AppText = ({
                          children,
                          variant = "body",
                          font = "primary",
                          style,
                          ...props
                        }: AppTextProps): JSX.Element => {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        { fontFamily: theme.typography.fonts[font] },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
};


const styles = StyleSheet.create({
  base: {
    color: theme.colors.black,
  },

  title: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
  },

  subtitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  bigTitle: {
    fontSize: 16,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.grey,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  body: {
    fontSize: 14,
  },

  caption: {
    fontSize: 12,
    color: theme.colors.grey,
  },
});
