  import type {JSX} from "react";
  import React from "react";
  import { TouchableOpacity, StyleSheet } from "react-native";

  import { ICONS_BUTTON_VARIANTS } from "@/themes/buttonVariants";
  import { theme } from "@/themes/theme";
  import { AppIcons } from "@/components/AppIcons";

  type IconLibrary = "Feather" | "FontAwesome" | "FontAwesome5";
  type Variant = keyof typeof ICONS_BUTTON_VARIANTS;

  interface AppIconsButtonProps {
    variant?: Variant;
    icon?: string;
    size?: number;
    iconLibrary?: IconLibrary;
    iconColor?: string;
    top?: number;
    onPress?: () => void;
  }

  export const AppIconsButton = ({
                                   variant = "eco",
                                   icon,
                                   iconLibrary = "Feather",
                                   iconColor = theme.colors.white,
                                   top = 0,
                                   onPress,
                                   size = 24,
                                 }: AppIconsButtonProps): JSX.Element => {
    const stylesVariant = ICONS_BUTTON_VARIANTS[variant];

    const backgroundColor =
      stylesVariant !== ICONS_BUTTON_VARIANTS.noBackground
        ? stylesVariant.backgroundColor
        : "transparent";

    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={[
          styles.button,
          {
            top: top,
            width: size,
            height: size,
            borderRadius: theme.radius.full,
            backgroundColor,
          },
        ]}
      >
        {(icon != null) && (
          <AppIcons
            icon={icon}
            iconLibrary={iconLibrary}
            size={size * 0.5}
            color={iconColor}
          />
        )}
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    button: {
      alignItems: "center",
      justifyContent: "center",
    },
  });
