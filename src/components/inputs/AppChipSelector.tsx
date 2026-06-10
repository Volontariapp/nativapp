import React from 'react';
import { View, FlatList, Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

export interface AppChipOption<T> {
  value: T;
  label: string;
  color?: string; // e.g. theme.colors.primaryEco
}

export interface AppChipSelectorProps<T> {
  options: AppChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string; // Optional custom title
  containerStyle?: ViewStyle;
  scrollStyle?: ViewStyle;
}

/**
 * A reusable horizontal selector of "chips" or "pills" with customizable options.
 * Useful for selecting categories, tags, or event types.
 */
export function AppChipSelector<T>({
  options,
  value,
  onChange,
  label,
  containerStyle,
  scrollStyle,
}: AppChipSelectorProps<T>): React.JSX.Element {
  const renderItem = ({ item, index }: { item: AppChipOption<T>; index: number }) => {
    const isSelected = value === item.value;
    const primaryColor = item.color ?? theme.colors.grey;
    const isLast = index === options.length - 1;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.chipButton,
          { borderColor: primaryColor },
          isSelected && { backgroundColor: primaryColor },
          pressed && { opacity: 0.7 },
          isLast && { marginRight: 0 },
        ]}
        onPress={() => {
          onChange(item.value);
        }}
      >
        <AppText
          style={[
            styles.chipText,
            isSelected && styles.chipTextSelected,
          ]}
        >
          {item.label}
        </AppText>
      </Pressable>
    );
  };

  return (
    <View style={containerStyle}>
      {label ? <AppText style={styles.label}>{label}</AppText> : null}
      
      <FlatList
        data={options}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.value)}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.scroll, scrollStyle]}
        contentContainerStyle={styles.scrollContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    color: theme.colors.grey,
    marginBottom: theme.spacing.xs,
    fontWeight: '600',
  },
  scroll: {
    marginTop: theme.spacing.xs,
  },
  scrollContent: {
    flexDirection: 'row',
  },
  chipButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    borderWidth: 2,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.white,
  },
  chipText: {
    fontSize: 14,
    color: theme.colors.black,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: theme.colors.white,
  },
});
