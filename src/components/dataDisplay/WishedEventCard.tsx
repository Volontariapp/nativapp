import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
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
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

export interface EventCardProps {
  event: AppEvent;
  variant?: 'A' | 'B';
  isFirstItem?: boolean;
  peekTrigger?: number;
}

export function WishedEventCard({
  event,
  variant = 'A',
  isFirstItem = false,
  peekTrigger = 0,
}: EventCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { unwish, participate } = useUserSocialActions();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const translateX = useSharedValue(0);
  const isRemoving = useSharedValue(false);

  const handleUnwish = useCallback(() => {
    void unwish(event.id);
  }, [unwish, event.id]);

  const handleParticipate = useCallback(() => {
    void participate(event.id);
  }, [participate, event.id]);

  // Démo B : Micro-animation Peek d'apprentissage automatique sur le 1er élément
  useEffect(() => {
    if (variant === 'B' && isFirstItem) {
      translateX.value = withSequence(
        withTiming(40, { duration: 320 }),
        withTiming(-40, { duration: 380 }),
        withSpring(0, { damping: 14, stiffness: 220 }),
      );
    }
  }, [variant, isFirstItem, peekTrigger, translateX]);

  // Geste de swipe horizontal
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-15, 15])
    .onUpdate((e) => {
      if (isRemoving.value) return;
      translateX.value = e.translationX;
    })
    .onEnd((e) => {
      if (isRemoving.value) return;
      // Glissement vers la droite > 85px : Participer
      if (e.translationX > 85) {
        isRemoving.value = true;
        translateX.value = withTiming(400, { duration: 220 }, (finished) => {
          if (finished === true) {
            scheduleOnRN(handleParticipate);
          }
        });
      }
      // Glissement vers la gauche < -85px : Retirer
      else if (e.translationX < -85) {
        isRemoving.value = true;
        translateX.value = withTiming(-400, { duration: 220 }, (finished) => {
          if (finished === true) {
            scheduleOnRN(handleUnwish);
          }
        });
      } else {
        translateX.value = withSpring(0, { damping: 15, stiffness: 250 });
      }
    });

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const participateActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, 35, 85], [0, 0.7, 1], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(translateX.value, [0, 85], [0.8, 1], Extrapolation.CLAMP),
      },
    ],
  }));

  const unwishActionStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-85, -35, 0], [1, 0.7, 0], Extrapolation.CLAMP),
    transform: [
      {
        scale: interpolate(translateX.value, [-85, 0], [1, 0.8], Extrapolation.CLAMP),
      },
    ],
  }));

  const isEcology =
    event.type === EventType.EVENT_TYPE_ECOLOGY ||
    String(event.type) === EventType[EventType.EVENT_TYPE_ECOLOGY];
  const isSocial =
    event.type === EventType.EVENT_TYPE_SOCIAL ||
    String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL];

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
    <View style={styles.swipeContainer}>
      {/* Fond Action Gauche (Swipe vers la droite -> Participer) */}
      <View style={[styles.backgroundAction, styles.backgroundParticipate]}>
        <Animated.View style={[styles.actionContent, participateActionStyle]}>
          <Feather name="check-circle" size={22} color={theme.colors.white} />
          <AppText style={styles.actionText}>Participer</AppText>
        </Animated.View>
      </View>

      {/* Fond Action Droite (Swipe vers la gauche -> Retirer) */}
      <View style={[styles.backgroundAction, styles.backgroundUnwish]}>
        <Animated.View style={[styles.actionContent, styles.actionContentRight, unwishActionStyle]}>
          <AppText style={styles.actionText}>Retirer</AppText>
          <Feather name="trash-2" size={22} color={theme.colors.white} />
        </Animated.View>
      </View>

      {/* Carte principale avec geste de swipe */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          {/* Indicateur de bord gauche pour Démo B */}
          {variant === 'B' && <View style={[styles.edgeIndicator, styles.edgeIndicatorGreen]} />}

          {/* Miniature de l'événement */}
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

          {/* DÉMO A : Boutons d'actions directs et discrets */}
          {variant === 'A' && (
            <View style={styles.demoAActionsContainer}>
              <Pressable
                style={styles.participateButton}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Participer à ${event.title}`}
                onPress={() => {
                  isRemoving.value = true;
                  translateX.value = withTiming(400, { duration: 220 }, (finished) => {
                    if (finished === true) {
                      scheduleOnRN(handleParticipate);
                    }
                  });
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
                  isRemoving.value = true;
                  translateX.value = withTiming(-400, { duration: 220 }, (finished) => {
                    if (finished === true) {
                      scheduleOnRN(handleUnwish);
                    }
                  });
                }}
              >
                <Feather name="x" size={15} color={theme.colors.grey} />
              </Pressable>
            </View>
          )}

          {/* DÉMO B : Chevrons de bord discrets indiquant le swipe */}
          {variant === 'B' && (
            <View style={styles.demoBIndicators}>
              <Feather
                name="chevron-right"
                size={16}
                color={theme.colors.grey}
                style={styles.swipeHint}
              />
            </View>
          )}

          {/* Indicateur de bord droit pour Démo B */}
          {variant === 'B' && <View style={[styles.edgeIndicatorRight, styles.edgeIndicatorRed]} />}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    swipeContainer: {
      position: 'relative',
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      borderRadius: 18,
    },
    backgroundAction: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      borderRadius: 18,
    },
    backgroundParticipate: {
      backgroundColor: theme.colors.primaryEco,
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
    demoBIndicators: {
      marginLeft: theme.spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: 0.5,
    },
    swipeHint: {
      opacity: 0.6,
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
    edgeIndicatorGreen: {
      backgroundColor: theme.colors.primaryEco,
    },
    edgeIndicatorRed: {
      backgroundColor: theme.colors.danger,
    },
  });
