import React, { useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  Vibration,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from '@/components/typography/AppText';
import { AppIcons } from '@/components/media/AppIcons';
import { AppButton } from '@/components/buttons/AppButton';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { BADGE_REGISTRY } from '@/components/dataDisplay/badge/badge.config';
import { BadgeMedallion } from '@/components/dataDisplay/badge/badge-medallion';
import type { BadgeVariant } from '@/components/dataDisplay/badge/badge.types';
import type { IconLibrary } from '@/shared/types/components';

export interface BadgeCelebrationModalProps {
  visible: boolean;
  variant?: BadgeVariant | null;
  badgeName?: string;
  badgeIcon?: string;
  iconLibrary?: IconLibrary;
  description?: string;
  onClose: () => void;
  testID?: string;
}

interface ConfettiItemProps {
  index: number;
  total: number;
  originX: number;
  originY: number;
  colors: string[];
}

function ConfettiPiece({
  index,
  total,
  originX,
  originY,
  colors,
}: ConfettiItemProps): React.JSX.Element {
  const angle = (index / total) * 2 * Math.PI + (index % 3) * 0.2;
  const distance = 110 + (index % 5) * 35;
  const targetX = Math.cos(angle) * distance;
  const targetY = Math.sin(angle) * distance + 40;
  const color = colors[index % colors.length];
  const size = 7 + (index % 4) * 2;
  const isCircle = index % 2 === 0;

  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      (index % 8) * 30,
      withTiming(1, {
        duration: 1200 + (index % 4) * 200,
        easing: Easing.out(Easing.cubic),
      }),
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const currentX = originX + targetX * p;
    const currentY = originY + targetY * p + (p * p * 80); // gravity drop
    const scale = Math.sin(p * Math.PI);
    const rotation = p * (360 + (index % 6) * 60);

    return {
      position: 'absolute',
      left: currentX,
      top: currentY,
      width: size,
      height: isCircle ? size : size * 1.5,
      borderRadius: isCircle ? size / 2 : 2,
      backgroundColor: color,
      opacity: (1 - p * 0.3) * (p > 0.05 ? 1 : p * 20),
      transform: [{ rotate: `${String(rotation)}deg` }, { scale }],
    };
  });

  return <Animated.View pointerEvents="none" style={animatedStyle} />;
}

export function BadgeCelebrationModal({
  visible,
  variant,
  badgeName,
  badgeIcon,
  iconLibrary,
  description,
  onClose,
  testID = 'badge-celebration-modal',
}: BadgeCelebrationModalProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { width, height } = useWindowDimensions();

  const def = variant != null ? BADGE_REGISTRY[variant] : null;
  const resolvedName = badgeName ?? def?.name ?? 'Nouveau Badge';
  const resolvedDescription = description ?? def?.description ?? '';
  const resolvedIcon = badgeIcon ?? def?.icon ?? 'medal';
  const resolvedIconLibrary = iconLibrary ?? def?.iconLibrary ?? 'FontAwesome5';

  const overlayOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.4);
  const cardOpacity = useSharedValue(0);
  const medallionScale = useSharedValue(0);
  const haloScale = useSharedValue(0.9);
  const haloOpacity = useSharedValue(0.6);

  useEffect(() => {
    if (visible) {
      if (Platform.OS !== 'web') {
        try {
          Vibration.vibrate([0, 50, 40, 80]);
        } catch {
          // ignore
        }
      }

      overlayOpacity.value = withTiming(1, { duration: 250 });
      cardScale.value = withSpring(1, { damping: 12, stiffness: 130 });
      cardOpacity.value = withTiming(1, { duration: 200 });

      medallionScale.value = withDelay(
        150,
        withSequence(
          withSpring(1.2, { damping: 8, stiffness: 160 }),
          withSpring(1.0, { damping: 10, stiffness: 140 }),
        ),
      );

      haloScale.value = withRepeat(
        withSequence(
          withTiming(1.3, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.95, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
        ),
        -1,
        true,
      );

      haloOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1400 }),
          withTiming(0.3, { duration: 1400 }),
        ),
        -1,
        true,
      );
    } else {
      overlayOpacity.value = 0;
      cardScale.value = 0.4;
      cardOpacity.value = 0;
      medallionScale.value = 0;
    }
  }, [visible, overlayOpacity, cardScale, cardOpacity, medallionScale, haloScale, haloOpacity]);

  const handleDismiss = () => {
    overlayOpacity.value = withTiming(0, { duration: 200 });
    cardScale.value = withTiming(0.8, { duration: 200 });
    cardOpacity.value = withTiming(0, { duration: 200 });
    onClose();
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const medallionAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: medallionScale.value }],
  }));

  const haloAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: haloScale.value }],
    opacity: haloOpacity.value,
  }));

  const confettiColors = useMemo(
    () => [
      theme.colors.gold,
      theme.colors.primaryEco,
      theme.colors.secondaryEco,
      theme.colors.primarySocio,
      theme.colors.diamond,
      theme.colors.warning,
      theme.colors.success,
    ],
    [theme],
  );

  const confettiPieces = useMemo(() => {
    return Array.from({ length: 36 }).map((_, i) => (
      <ConfettiPiece
        key={i}
        index={i}
        total={36}
        originX={width / 2}
        originY={height * 0.38}
        colors={confettiColors}
      />
    ));
  }, [width, height, confettiColors]);

  if (!visible) {
    return (
      <Modal visible={false} transparent onRequestClose={onClose}>
        <View />
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleDismiss}>
      <Animated.View style={[styles.overlay, overlayAnimatedStyle]} testID={testID}>
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={handleDismiss}
          accessibilityRole="button"
          accessibilityLabel="Fermer l'arrière-plan"
        />

        {confettiPieces}

        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <Pressable
            style={styles.closeButton}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Fermer la célébration"
            hitSlop={12}
          >
            <AppIcons icon="x" iconLibrary="Feather" size={20} color={theme.colors.grey} />
          </Pressable>

          <View style={styles.celebrationHeader}>
            <AppText variant="caption" style={styles.congratsTag}>
              Nouveau badge débloqué !
            </AppText>
          </View>

          <View style={styles.medallionWrapper}>
            <Animated.View style={[styles.haloRing, haloAnimatedStyle]}>
              <LinearGradient
                colors={[theme.colors.goldBorder, 'rgba(255, 215, 0, 0)']}
                style={styles.haloGradient}
              />
            </Animated.View>

            <Animated.View style={medallionAnimatedStyle}>
              {variant != null ? (
                <BadgeMedallion variant={variant} size="xl" />
              ) : (
                <View style={styles.fallbackMedallion}>
                  <AppIcons
                    icon={resolvedIcon}
                    iconLibrary={resolvedIconLibrary}
                    size={48}
                    color={theme.colors.gold}
                  />
                </View>
              )}
            </Animated.View>
          </View>

          <View style={styles.body}>
            <AppText variant="title" style={styles.title}>
              {resolvedName}
            </AppText>

            {resolvedDescription.length > 0 && (
              <View style={styles.descriptionBox}>
                <AppText variant="body" style={styles.description}>
                  {resolvedDescription}
                </AppText>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <AppButton
              text="Continuer"
              variant="eco"
              onPress={handleDismiss}
              style={styles.actionButton}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.badgeOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    card: {
      backgroundColor: theme.colors.white,
      borderRadius: theme.radius.lg,
      paddingHorizontal: theme.spacing.xl,
      paddingTop: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
      position: 'relative',
      ...theme.shadows.card,
    },
    closeButton: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      padding: theme.spacing.xs,
      zIndex: 10,
    },
    celebrationHeader: {
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    congratsTag: {
      fontSize: theme.typography.fontSize.xs,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.primaryEco,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      backgroundColor: theme.colors.badgeEcoBackground,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radius.full,
    },
    medallionWrapper: {
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: theme.spacing.lg,
      width: 140,
      height: 140,
    },
    haloRing: {
      position: 'absolute',
      width: 130,
      height: 130,
      borderRadius: 65,
      overflow: 'hidden',
    },
    haloGradient: {
      width: '100%',
      height: '100%',
      borderRadius: 65,
    },
    fallbackMedallion: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.goldBackground,
      borderWidth: 3,
      borderColor: theme.colors.goldBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
    body: {
      width: '100%',
      alignItems: 'center',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.fontSize.xl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.black,
      textAlign: 'center',
    },
    descriptionBox: {
      backgroundColor: theme.colors.background,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radius.md,
      width: '100%',
    },
    description: {
      fontSize: theme.typography.fontSize.sm,
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: 20,
    },
    footer: {
      width: '100%',
    },
    actionButton: {
      width: '100%',
    },
  });
