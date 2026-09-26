import React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { BADGE_REGISTRY } from './badge.config';
import { BADGE_SIZE_CONFIG, getMedallionColors } from './badge-style.utils';
import type { BadgeSize, BadgeVariant } from './badge.types';

interface BadgeMedallionProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
}

export function BadgeMedallion({
  variant,
  size = 'md',
  style,
}: BadgeMedallionProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const def = BADGE_REGISTRY[variant];

  const config = BADGE_SIZE_CONFIG[size];
  const colors = getMedallionColors(def, theme);
  const calculatedBorderWidth = config.borderWidth + (colors.borderWidthBoost ?? 0);
  const containerRadius = config.containerSize / 2;

  const dynamicContainerStyle = {
    width: config.containerSize,
    height: config.containerSize,
    borderRadius: containerRadius,
    backgroundColor: colors.backgroundColor,
    borderColor: colors.borderColor,
    borderWidth: calculatedBorderWidth,
  };

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container, dynamicContainerStyle]}>
        {colors.isDiamond === true ? (
          <LinearGradient
            colors={[theme.colors.diamondBackground, theme.colors.diamondBorder]}
            style={[StyleSheet.absoluteFillObject, { borderRadius: containerRadius }]}
          />
        ) : null}

        {def.icon != null ? (
          <AppIcons
            icon={def.icon}
            iconLibrary={def.iconLibrary}
            size={config.iconSize}
            color={colors.iconColor}
          />
        ) : (
          <AppText
            variant="title"
            font="primary"
            style={[styles.tierNumber, { fontSize: config.fontSize, color: colors.textColor }]}
          >
            {def.tierText}
          </AppText>
        )}
      </View>

      {def.badgeNumber != null && (
        <View
          style={[
            styles.countPill,
            {
              backgroundColor: colors.borderColor,
              paddingHorizontal: config.pillPaddingH,
              paddingVertical: config.pillPaddingV,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={[
              styles.countPillText,
              { fontSize: config.pillFontSize, color: theme.colors.white },
            ]}
          >
            {def.badgeNumber}
          </AppText>
        </View>
      )}
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      ...theme.shadows.card,
    },
    tierNumber: {
      fontWeight: theme.typography.fontWeight.bold,
      textAlign: 'center',
    },
    countPill: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      borderRadius: theme.radius.full,
      borderWidth: 1.5,
      borderColor: theme.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
    },
    countPillText: {
      fontWeight: theme.typography.fontWeight.bold,
      lineHeight: 12,
    },
  });
