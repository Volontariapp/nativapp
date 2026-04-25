    import type {JSX} from "react";
    import React from "react";
    import Feather from "react-native-vector-icons/Feather";
    import FontAwesome from "react-native-vector-icons/FontAwesome";
    import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
    import MaterialDesignIcons from "react-native-vector-icons/MaterialCommunityIcons"
    import Ionicons from "react-native-vector-icons/Ionicons";

    type IconLibrary = "Feather" | "FontAwesome" | "FontAwesome5" | "MaterialDesignIcons" | "Ionicons";

    import {
      StyleSheet,
      View,
    } from "react-native";
    import { theme } from "@/themes/theme";

    interface AppIconsProps {
      icon: string;
      iconLibrary?: IconLibrary;
      color?: string;
      size: number;
    }

    export const AppIcons = ({
                                icon,
                                iconLibrary = "Feather",
                                color = theme.colors.white,
                                size,
                              }: AppIconsProps): JSX.Element => {
      let IconComponent;
      if (iconLibrary === "FontAwesome5") IconComponent = FontAwesome5;
      else if (iconLibrary === "FontAwesome") IconComponent = FontAwesome;
      else if (iconLibrary === "MaterialDesignIcons") IconComponent = MaterialDesignIcons;
      else if (iconLibrary === "Ionicons") IconComponent = Ionicons;
      else IconComponent = Feather;

      return (
          <View style={styles.content}>
            {icon && (
                <IconComponent name={icon} size={size} color={color}/>
            )}
          </View>
      );
    };


    const styles = StyleSheet.create({
      content: {
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing.sm,
      },
    });

