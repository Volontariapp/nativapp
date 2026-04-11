import type {JSX} from "react";
import React from "react";

type IconLibrary = "Feather" | "FontAwesome" | "FontAwesome5";

import {
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { BUTTON_VARIANTS } from "@/themes/buttonVariants";
import { theme } from "@/themes/theme";
import {AppIcons} from "@/components/AppIcons";

type Variant = keyof typeof BUTTON_VARIANTS;

interface AppButtonProps {
  text: string;
  variant?: Variant;
  icon?: string;
  iconLibrary?: IconLibrary;
  onPress?: () => void;
}

export const AppButton = ({
                            text,
                            variant = "eco",
                            icon,
                            iconLibrary = "Feather",
                            onPress,
                          }: AppButtonProps): JSX.Element => {
  const stylesVariant = BUTTON_VARIANTS[variant];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.button,
        { backgroundColor: stylesVariant.backgroundColor, borderColor: stylesVariant.borderColor, borderWidth:1},
      ]}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {(icon != null) && (
          <AppIcons icon={icon} iconLibrary={iconLibrary} size={20} color={stylesVariant.textColor}/>
        )}
        <Text
          style={[
            styles.text,
            {
              color: stylesVariant.textColor,
              fontFamily: theme.typography.fonts.primary,
            },
          ]}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  button: {
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
  },

  text: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

