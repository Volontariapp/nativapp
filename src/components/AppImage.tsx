import type {JSX} from "react";
import React from "react";

import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ImageStyle,
} from "react-native";
import {theme} from "@/themes/theme";

interface AppImageProps {
  image: ImageSourcePropType | string;
  rounded?: number;
  height?: number;
  width?: number;
  style?: StyleProp<ImageStyle>;
}

export const AppImage = ({
                           image,
                           rounded = 0,
                           height,
                           width,
                           style,
                         }: AppImageProps) : JSX.Element => {

  const resolvedSource: ImageSourcePropType =
    typeof image === "string" ? { uri: image } : image;

  return (
      <View style={styles.content}>
        <Image
          source={resolvedSource}
          style={[{ width, height, borderRadius: rounded }, style]}
        />
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

