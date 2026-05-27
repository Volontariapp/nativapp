import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  type ViewStyle,
  type PressableStateCallbackType,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { AppText } from '@/components/typography/AppText';
import { theme } from '@/shared/themes/theme';

interface AdminListItemProps {
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  icon?: string;
  style?: ViewStyle;
}

export const AdminListItem = ({
  title,
  subtitle,
  rightElement,
  onPress,
  icon,
  style,
}: AdminListItemProps): React.JSX.Element => {
  const pressableStyle = ({ pressed }: PressableStateCallbackType): ViewStyle[] => [
    styles.container,
    style ?? {},
    pressed ? styles.pressed : {},
  ];

  const inner = (
    <>
      <View style={styles.leftContent}>
        {icon != null && (
          <Icon name={icon} size={20} color={theme.colors.grey} style={styles.icon} />
        )}
        <View>
          <AppText style={styles.title}>{title}</AppText>
          {subtitle != null && <AppText style={styles.subtitle}>{subtitle}</AppText>}
        </View>
      </View>

      <View style={styles.rightContent}>
        {rightElement}
        {onPress != null && rightElement == null && (
          <Icon name="chevron-right" size={20} color={theme.colors.lightGrey} />
        )}
      </View>
    </>
  );

  if (onPress != null) {
    return (
      <Pressable style={pressableStyle} onPress={onPress}>
        {inner}
      </Pressable>
    );
  }

  return <View style={[styles.container, style]}>{inner}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGrey,
  },
  pressed: {
    opacity: 0.7,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.black,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.grey,
    marginTop: 2,
  },
});
