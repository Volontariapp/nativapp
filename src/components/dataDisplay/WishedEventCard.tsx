import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  type LayoutChangeEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import { AppText } from '@/components/typography/AppText';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { mapEventType } from '@/shared/lib/event-mappers.utils';
import { EventType } from '@volontariapp/contracts';
import Feather from 'react-native-vector-icons/Feather';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';
import { Image } from 'expo-image';
import { getEventImageUri } from '@/api/event/event-cover.utils';
import { LIST_THUMBNAIL_RADIUS, LIST_THUMBNAIL_SIZE } from '@/components/event/event-image-frames';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  Extrapolation,
  Easing,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export interface EventCardProps {
  event: AppEvent;
  variant?: 'A' | 'B';
  isFirstItem?: boolean;
}

export function WishedEventCard({ event, variant = 'A' }: EventCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { unwish, participate } = useUserSocialActions();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const isEcology =
    event.type === EventType.EVENT_TYPE_ECOLOGY ||
    String(event.type) === EventType[EventType.EVENT_TYPE_ECOLOGY];
  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];

  // Couleur thématique dynamique : Bleu pour Social, Vert pour Écologie
  const participateColor = isSocial ? theme.colors.primarySocio : theme.colors.primaryEco;

  const cardTranslateX = useSharedValue(0);
  const containerHeight = useSharedValue<number | undefined>(undefined);
  const containerMarginBottom = useSharedValue(12);
  const containerOpacity = useSharedValue(1);
  const isRemoving = useSharedValue(false);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      if (containerHeight.value === undefined && !isRemoving.value) {
        containerHeight.value = e.nativeEvent.layout.height;
      }
    },
    [containerHeight, isRemoving],
  );

  const handleUnwish = useCallback(() => {
    void unwish(event.id);
  }, [unwish, event.id]);

  const handleParticipate = useCallback(() => {
    void participate(event.id);
  }, [participate, event.id]);

  // Animation de sortie sans rebond : glissement horizontal puis effondrement doux de la hauteur
  // Animation de sortie sans rebond : glissement horizontal puis effondrement doux de la hauteur
  const executeRemoval = useCallback(
    (direction: 'right' | 'left', onAction: () => void) => {
      if (isRemoving.value) return;
      isRemoving.value = true;

      if (process.env.NODE_ENV === 'test') {
        onAction();
        return;
      }

      containerHeight.value ??= 100;

      const targetX = direction === 'right' ? 420 : -420;

      // 1. Glissement horizontal rapide sans rebond (cubic easing)
      cardTranslateX.value = withTiming(
        targetX,
        { duration: 200, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished === true) {
            // 2. Affaissement doux de la hauteur et de la marge pour que la carte suivante prenne sa place
            containerOpacity.value = withTiming(0, { duration: 150 });
            containerMarginBottom.value = withTiming(0, {
              duration: 220,
              easing: Easing.out(Easing.cubic),
            });
            containerHeight.value = withTiming(
              0,
              { duration: 220, easing: Easing.out(Easing.cubic) },
              (hFinished) => {
                if (hFinished === true) {
                  scheduleOnRN(onAction);
                }
              },
            );
          }
        },
      );
    },
    [cardTranslateX, containerHeight, containerMarginBottom, containerOpacity, isRemoving],
  );

  // Geste de swipe horizontal (exécuté sur le thread JS pour éviter tout crash de worklet UI)
  const panGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      if (isRemoving.value) return;
      cardTranslateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (isRemoving.value) return;
      if (e.translationX > 85) {
        executeRemoval('right', handleParticipate);
      } else if (e.translationX < -85) {
        executeRemoval('left', handleUnwish);
      } else {
        // Retour en place doux sans rebond
        cardTranslateX.value = withTiming(0, {
          duration: 180,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    height: containerHeight.value,
    marginBottom: containerMarginBottom.value,
    opacity: containerOpacity.value,
    overflow: 'hidden',
  }));

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: cardTranslateX.value }],
  }));

  // Le fond gauche (Participer) n'apparaît que lors d'un swipe vers la droite
  const participateBgStyle = useAnimatedStyle(() => ({
    opacity: cardTranslateX.value > 0 ? 1 : 0,
    zIndex: cardTranslateX.value > 0 ? 1 : 0,
  }));

  // Le fond droit (Retirer/Supprimer) n'apparaît que lors d'un swipe vers la gauche
  const unwishBgStyle = useAnimatedStyle(() => ({
    opacity: cardTranslateX.value < 0 ? 1 : 0,
    zIndex: cardTranslateX.value < 0 ? 1 : 0,
  }));

  const participateActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cardTranslateX.value, [0, 35, 85], [0, 0.7, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(cardTranslateX.value, [0, 85], [0.85, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const unwishActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cardTranslateX.value, [-85, -35, 0], [1, 0.7, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(cardTranslateX.value, [-85, 0], [1, 0.85], Extrapolation.CLAMP),
      },
    ],
  }));

  const typeColor = isEcology
    ? theme.colors.primaryEco
    : isSocial
      ? theme.colors.primarySocio
      : theme.colors.grey;

  const typeBg = isEcology
    ? `${theme.colors.primaryEco}20`
    : isSocial
      ? `${theme.colors.primarySocio}20`
      : `${theme.colors.grey}20`;

  const date = new Date(event.startAt);
  const formattedDate = date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const imageUri = getEventImageUri(event);

  return (
    <Animated.View style={containerAnimatedStyle} onLayout={onLayout}>
      <View style={styles.swipeContainer}>
        {/* Fond Action Gauche : Participer (Bleu si Social, Vert si Écologie - visible uniquement si swipe droite) */}
        <Animated.View
          style={[
            styles.backgroundAction,
            styles.backgroundParticipate,
            { backgroundColor: participateColor },
            participateBgStyle,
          ]}
        >
          <Animated.View style={[styles.actionContent, participateActionStyle]}>
            <Feather name="check-circle" size={22} color={theme.colors.white} />
            <AppText style={styles.actionText}>Participer</AppText>
          </Animated.View>
        </Animated.View>

        {/* Fond Action Droite : Retirer (Rouge corail - visible uniquement si swipe gauche) */}
        <Animated.View style={[styles.backgroundAction, styles.backgroundUnwish, unwishBgStyle]}>
          <Animated.View
            style={[styles.actionContent, styles.actionContentRight, unwishActionStyle]}
          >
            <AppText style={styles.actionText}>Retirer</AppText>
            <Feather name="trash-2" size={22} color={theme.colors.white} />
          </Animated.View>
        </Animated.View>

        {/* Carte principale */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.card, cardAnimatedStyle]}>
            {/* Démo B : bordures latérales discrètes sans rebond */}
            {variant === 'B' && (
              <View style={[styles.edgeIndicator, { backgroundColor: participateColor }]} />
            )}

            <TouchableOpacity
              style={styles.cardTouchArea}
              activeOpacity={0.85}
              onPress={() => {
                navigation.navigate('EventDetail', { event });
              }}
            >
              <View style={[styles.imageContainer, { backgroundColor: typeBg }]}>
                <Image
                  source={{ uri: imageUri }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                  accessibilityIgnoresInvertColors
                />
              </View>

              <View style={styles.content}>
                <View style={[styles.tag, { backgroundColor: typeBg }]}>
                  <AppText style={[styles.tagText, { color: typeColor }]}>
                    {mapEventType(event.type)}
                  </AppText>
                </View>

                <AppText style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                  {event.title}
                </AppText>

                <View style={styles.detailRow}>
                  <Feather name="map-pin" size={14} color={theme.colors.grey} />
                  <AppText style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                    {event.localisationName}
                  </AppText>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="calendar" size={14} color={theme.colors.grey} />
                  <AppText style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
                    {formattedDate} - {formattedTime}
                  </AppText>
                </View>
              </View>
            </TouchableOpacity>

            {/* DÉMO A : Bouton direct vert + croix discrète */}
            {variant === 'A' && (
              <View style={styles.demoAActionsContainer}>
                <Pressable
                  style={styles.participateButton}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Participer à ${event.title}`}
                  onPress={() => {
                    executeRemoval('right', handleParticipate);
                  }}
                >
                  <Feather name="check" size={13} color={theme.colors.white} />
                  <AppText style={styles.participateButtonText}>Participer</AppText>
                </Pressable>

                <Pressable
                  style={styles.unwishButton}
                  hitSlop={6}
                  accessibilityRole="button"
                  accessibilityLabel={`Retirer ${event.title} de la wishlist`}
                  onPress={() => {
                    executeRemoval('left', handleUnwish);
                  }}
                >
                  <Feather name="x" size={15} color={theme.colors.grey} />
                </Pressable>
              </View>
            )}

            {/* DÉMO B : Repère discret à droite */}
            {variant === 'B' && (
              <View style={[styles.edgeIndicatorRight, styles.edgeIndicatorRed]} />
            )}
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    swipeContainer: {
      position: 'relative',
      borderRadius: 18,
      overflow: 'hidden',
    },
    backgroundAction: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      borderRadius: 18,
    },
    backgroundParticipate: {
      justifyContent: 'flex-start',
    },
    backgroundUnwish: {
      backgroundColor: theme.colors.danger,
      justifyContent: 'flex-end',
    },
    actionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionContentRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    actionText: {
      color: theme.colors.white,
      fontWeight: '700',
      fontSize: 14,
    },
    card: {
      backgroundColor: theme.colors.white,
      padding: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      ...theme.shadows.card,
      borderRadius: 18,
      position: 'relative',
    },
    cardTouchArea: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    imageContainer: {
      width: LIST_THUMBNAIL_SIZE,
      height: LIST_THUMBNAIL_SIZE,
      borderRadius: LIST_THUMBNAIL_RADIUS,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      justifyContent: 'center',
    },
    tag: {
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: 10,
      marginBottom: 4,
    },
    tagText: {
      fontSize: 10,
      fontWeight: 'bold',
    },
    title: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    detailText: {
      fontSize: 12,
      color: theme.colors.grey,
      marginLeft: 6,
      flex: 1,
    },
    demoAActionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginLeft: theme.spacing.sm,
    },
    participateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.colors.primaryEco,
      paddingVertical: 7,
      paddingHorizontal: 10,
      borderRadius: 12,
    },
    participateButtonText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '700',
    },
    unwishButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: theme.colors.text === '#000' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    edgeIndicator: {
      position: 'absolute',
      left: 0,
      top: 14,
      bottom: 14,
      width: 3.5,
      borderTopRightRadius: 3,
      borderBottomRightRadius: 3,
    },
    edgeIndicatorRight: {
      position: 'absolute',
      right: 0,
      top: 14,
      bottom: 14,
      width: 3.5,
      borderTopLeftRadius: 3,
      borderBottomLeftRadius: 3,
    },
    edgeIndicatorRed: {
      backgroundColor: theme.colors.danger,
    },
  });
