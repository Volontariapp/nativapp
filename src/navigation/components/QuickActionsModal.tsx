import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Pressable, Modal, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';

import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 32, 400);
const CENTER_BUTTON_SIZE = 60;

export interface QuickActionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectCreate: () => void;
  onSelectManage: () => void;
}

export function QuickActionsModal({
  visible,
  onClose,
  onSelectCreate,
  onSelectManage,
}: QuickActionsModalProps): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { theme, themeMode } = useAppTheme();
  const styles = useStyles(createStyles);

  const overlayOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(20);
  const cardScale = useSharedValue(0.98);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = 0;
      cardTranslateY.value = 20;
      cardScale.value = 0.98;

      overlayOpacity.value = withTiming(1, {
        duration: 180,
        easing: Easing.out(Easing.quad),
      });
      cardTranslateY.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
      cardScale.value = withTiming(1, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [visible, overlayOpacity, cardTranslateY, cardScale]);

  const handleDismiss = useCallback(() => {
    overlayOpacity.value = withTiming(0, {
      duration: 140,
      easing: Easing.in(Easing.quad),
    });
    cardTranslateY.value = withTiming(15, {
      duration: 140,
      easing: Easing.in(Easing.cubic),
    });
    cardScale.value = withTiming(0.98, {
      duration: 140,
      easing: Easing.in(Easing.cubic),
    });
    onClose();
  }, [onClose, overlayOpacity, cardTranslateY, cardScale]);

  const handleAction = useCallback(
    (actionFn: () => void) => {
      overlayOpacity.value = withTiming(0, {
        duration: 130,
        easing: Easing.in(Easing.quad),
      });
      cardTranslateY.value = withTiming(12, {
        duration: 130,
        easing: Easing.in(Easing.cubic),
      });
      cardScale.value = withTiming(0.98, {
        duration: 130,
        easing: Easing.in(Easing.cubic),
      });
      actionFn();
    },
    [overlayOpacity, cardTranslateY, cardScale],
  );

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: cardTranslateY.value }, { scale: cardScale.value }],
  }));

  if (!visible) {
    return (
      <Modal visible={false} transparent onRequestClose={onClose}>
        <View />
      </Modal>
    );
  }

  // Positionnement dynamique au-dessus de la barre de navigation
  const bottomInset = Math.max(insets.bottom, 15);
  const triggerBottom = bottomInset + 17;
  const cardBottom = bottomInset + 77 + 16;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
      statusBarTranslucent
    >
      <View style={styles.rootContainer}>
        {/* Arrière-plan flouté avec backdrop dismiss */}
        <Animated.View style={[StyleSheet.absoluteFillObject, overlayAnimatedStyle]}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Fermer le menu d'actions"
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 45 : 85}
              tint={themeMode === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFillObject}
            />
            <View
              style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor:
                    themeMode === 'dark' ? 'rgba(0, 0, 0, 0.55)' : 'rgba(0, 0, 0, 0.28)',
                },
              ]}
            />
          </Pressable>
        </Animated.View>

        {/* Carte flottante (Glassmorphism au-dessus de la nav bar) */}
        <Animated.View
          style={[
            styles.cardFloatingWrapper,
            { bottom: cardBottom },
            cardAnimatedStyle,
            overlayAnimatedStyle,
          ]}
        >
          <View style={styles.cardContainer}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 70 : 100}
              tint={themeMode === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.cardContent}>
              {/* En-tête de la carte */}
              <View style={styles.cardHeader}>
                <View style={styles.tagBadge}>
                  <Feather name="zap" size={12} color={theme.colors.primaryEco} />
                  <AppText style={styles.tagBadgeText}>ACTIONS RAPIDES</AppText>
                </View>

                <Pressable
                  style={styles.closeIconButton}
                  onPress={handleDismiss}
                  hitSlop={12}
                  accessibilityRole="button"
                  accessibilityLabel="Fermer"
                >
                  <Feather name="x" size={18} color={theme.colors.grey} />
                </Pressable>
              </View>

              <AppText style={styles.cardTitle}>Que souhaitez-vous faire ?</AppText>

              {/* Bouton 1 : Créer (+) */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => {
                  handleAction(onSelectCreate);
                }}
                accessibilityRole="button"
                accessibilityLabel="Créer un événement ou un post"
              >
                <View style={[styles.actionIconContainer, styles.actionIconEco]}>
                  <Feather name="plus" size={24} color={theme.colors.white} />
                </View>

                <View style={styles.actionTextColumn}>
                  <AppText style={styles.actionTitle}>Créer</AppText>
                  <AppText style={styles.actionSubtitle}>
                    Organiser un événement ou publier un post
                  </AppText>
                </View>

                <View style={[styles.arrowBadge, styles.arrowBadgeEco]}>
                  <Feather name="chevron-right" size={16} color={theme.colors.primaryEco} />
                </View>
              </Pressable>

              {/* Bouton 2 : Gérer (sliders) */}
              <Pressable
                style={({ pressed }) => [
                  styles.actionButton,
                  pressed && styles.actionButtonPressed,
                ]}
                onPress={() => {
                  handleAction(onSelectManage);
                }}
                accessibilityRole="button"
                accessibilityLabel="Gérer mes événements et posts"
              >
                <View style={[styles.actionIconContainer, styles.actionIconSocio]}>
                  <Feather name="sliders" size={20} color={theme.colors.white} />
                </View>

                <View style={styles.actionTextColumn}>
                  <AppText style={styles.actionTitle}>Gérer</AppText>
                  <AppText style={styles.actionSubtitle}>
                    Mes événements, participations et publications
                  </AppText>
                </View>

                <View style={[styles.arrowBadge, styles.arrowBadgeSocio]}>
                  <Feather name="chevron-right" size={16} color={theme.colors.primarySocio} />
                </View>
              </Pressable>
            </View>
          </View>
        </Animated.View>

        {/* Bouton de bascule vers le bas (chevron-down) aligné avec la nav bar */}
        <Animated.View
          style={[styles.toggleTriggerContainer, { bottom: triggerBottom }, overlayAnimatedStyle]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.toggleTriggerButton,
              pressed && styles.toggleTriggerButtonPressed,
            ]}
            onPress={handleDismiss}
            accessibilityRole="button"
            accessibilityLabel="Fermer le menu"
          >
            <Feather name="chevron-down" size={30} color={theme.colors.reversed} />
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    rootContainer: {
      flex: 1,
    },
    cardFloatingWrapper: {
      position: 'absolute',
      alignSelf: 'center',
      width: CARD_WIDTH,
      zIndex: 10,
    },
    cardContainer: {
      borderRadius: 24,
      overflow: 'hidden',
      borderWidth: 1.2,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.14)',
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(255, 255, 255, 0.94)' : 'rgba(26, 30, 36, 0.92)',
      boxShadow: '0 16px 36px rgba(0, 0, 0, 0.3)',
    },
    cardContent: {
      padding: 18,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    tagBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(47, 110, 62, 0.12)' : 'rgba(47, 110, 62, 0.25)',
    },
    tagBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      color: theme.colors.primaryEco,
    },
    closeIconButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.text,
      marginBottom: 16,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.025)' : 'rgba(255, 255, 255, 0.04)',
    },
    actionButtonPressed: {
      opacity: 0.82,
      transform: [{ scale: 0.985 }],
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
    },
    actionIconContainer: {
      width: 46,
      height: 46,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 14,
    },
    actionIconEco: {
      backgroundColor: theme.colors.primaryEco,
      boxShadow: '0 4px 10px rgba(47, 110, 62, 0.35)',
    },
    actionIconSocio: {
      backgroundColor: theme.colors.primarySocio,
      boxShadow: '0 4px 10px rgba(31, 111, 139, 0.35)',
    },
    actionTextColumn: {
      flex: 1,
      justifyContent: 'center',
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.text,
    },
    actionSubtitle: {
      fontSize: 12,
      color: theme.colors.grey,
      marginTop: 2,
    },
    arrowBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    arrowBadgeEco: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(47, 110, 62, 0.12)' : 'rgba(47, 110, 62, 0.22)',
    },
    arrowBadgeSocio: {
      backgroundColor:
        theme.colors.text === '#000' ? 'rgba(31, 111, 139, 0.12)' : 'rgba(31, 111, 139, 0.22)',
    },
    toggleTriggerContainer: {
      position: 'absolute',
      alignSelf: 'center',
      zIndex: 10,
    },
    toggleTriggerButton: {
      width: CENTER_BUTTON_SIZE,
      height: CENTER_BUTTON_SIZE,
      borderRadius: CENTER_BUTTON_SIZE / 2,
      backgroundColor: theme.colors.primaryEco,
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 6px 14px rgba(0, 0, 0, 0.35)',
    },
    toggleTriggerButtonPressed: {
      opacity: 0.85,
    },
  });
