  import React from "react";
  import { Text, View, StyleSheet } from "react-native";
  import { TagsNames, TAGS_CONFIG } from "@/types/tagsTypes";
  import {AppIcons} from "@/components/AppIcons";
  import {theme} from "@/themes/theme";

  interface TagProps {
    type: TagsNames;
  }

  export const TagComponent = ({ type }: TagProps) => {
    const tag = TAGS_CONFIG[type];

    return (
      <View
        style={[
          styles.container,
          { backgroundColor: tag.backgroundColor },
        ]}
      >
        { tag.icon && <AppIcons icon={tag.icon} size={12}/> }
        <Text style={[styles.text, { color: tag.textColor }]}>
          {tag.textContent}
        </Text>
      </View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
      alignSelf: "flex-start",
      flexDirection: "row",
      gap: theme.spacing.xs,
    },
    text: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.medium,
    },
  });
