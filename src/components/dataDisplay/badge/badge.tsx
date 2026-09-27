import React, { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { AppText } from '@/components/typography/AppText';
import { useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { BADGE_REGISTRY } from './badge.config';
import { BadgeMedallion } from './badge-medallion';
import { BadgeModal } from './badge-modal';
import type { BadgeProps } from './badge.types';

export function Badge({
  variant,
  size = 'md',
  showLabel = false,
  onPress,
  disableModal = false,
  style,
  testID,
}: BadgeProps): React.JSX.Element {
  const styles = useStyles(createStyles);
  const [modalVisible, setModalVisible] = useState(false);

  const def = BADGE_REGISTRY[variant];

  const handlePress = () => {
    if (onPress != null) {
      onPress(variant);
      return;
    }
    if (!disableModal) {
      setModalVisible(true);
    }
  };

  return (
    <>
      <Pressable
        testID={testID}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={`Badge ${def.name}`}
        accessibilityHint="Appuyer pour afficher les détails et le mode d'obtention de ce badge"
        style={({ pressed }) => [styles.wrapper, pressed && styles.pressed, style]}
      >
        <BadgeMedallion variant={variant} size={size} />

        {showLabel && (
          <AppText
            variant="caption"
            numberOfLines={2}
            style={[styles.label, size === 'sm' && styles.labelSmall]}
          >
            {def.name}
          </AppText>
        )}
      </Pressable>

      {!disableModal && (
        <BadgeModal
          visible={modalVisible}
          variant={variant}
          onClose={() => {
            setModalVisible(false);
          }}
        />
      )}
    </>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    pressed: {
      opacity: 0.75,
      transform: [{ scale: 0.96 }],
    },
    label: {
      fontSize: 12,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text,
      textAlign: 'center',
      maxWidth: 80,
    },
    labelSmall: {
      fontSize: 10,
      maxWidth: 64,
    },
  });
