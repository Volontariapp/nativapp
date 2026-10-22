import React, { useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
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
import Animated, { FadeOut } from 'react-native-reanimated';
import ReanimatedSwipeable, {
  SwipeDirection as SwipeableSide,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useWishedCardSwipe, type SwipeDirection } from './use-wished-card-swipe';

export interface EventCardProps {
  event: AppEvent;
  variant?: 'A' | 'B';
  isFirstItem?: boolean;
}

const ACTION_WIDTH = 120;

type CardStyles = ReturnType<typeof createStyles>;

function matchesType(event: AppEvent, type: EventType): boolean {
  return event.type === type || String(event.type) === EventType[type];
}

function formatSchedule(startAt: string): string {
  const date = new Date(startAt);
  const day = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${day} - ${time}`;
}

interface CardInfoProps {
  event: AppEvent;
  styles: CardStyles;
  typeColor: string;
  typeBg: string;
  greyColor: string;
  onPress: () => void;
}

function CardInfo({
  event,
  styles,
  typeColor,
  typeBg,
  greyColor,
  onPress,
}: CardInfoProps): React.JSX.Element {
  return (
    <Pressable style={styles.cardTouchArea} onPress={onPress}>
      <View style={[styles.imageContainer, { backgroundColor: typeBg }]}>
        <Image
          source={{ uri: getEventImageUri(event) }}
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
          <Feather name="map-pin" size={14} color={greyColor} />
          <AppText style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
            {event.localisationName}
          </AppText>
        </View>

        <View style={styles.detailRow}>
          <Feather name="calendar" size={14} color={greyColor} />
          <AppText style={styles.detailText} numberOfLines={1} ellipsizeMode="tail">
            {formatSchedule(event.startAt)}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

interface SwipeActionProps {
  label: string;
  icon: string;
  backgroundColor: string;
  styles: CardStyles;
}

function SwipeAction({
  label,
  icon,
  backgroundColor,
  styles,
}: SwipeActionProps): React.JSX.Element {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.actionPanel, { backgroundColor }]}>
      <Feather name={icon} size={22} color={theme.colors.white} />
      <AppText style={styles.actionText}>{label}</AppText>
    </View>
  );
}

export function WishedEventCard({ event, variant = 'A' }: EventCardProps): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const { unwish, participate } = useUserSocialActions();
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const isEcology = matchesType(event, EventType.EVENT_TYPE_ECOLOGY);
  const isSocial = matchesType(event, EventType.EVENT_TYPE_SOCIAL);

  // Couleur thématique dynamique : Bleu pour Social, Vert pour Écologie
  const participateColor = isSocial ? theme.colors.primarySocio : theme.colors.primaryEco;
  const typeColor = isEcology
    ? theme.colors.primaryEco
    : isSocial
      ? theme.colors.primarySocio
      : theme.colors.grey;
  const typeBg = `${typeColor}20`;

  const onCommit = useCallback(
    async (direction: SwipeDirection) => {
      await (direction === 'right' ? participate(event.id) : unwish(event.id));
    },
    [participate, unwish, event.id],
  );
  const { swipeRef, commit } = useWishedCardSwipe(onCommit);

  const openDetail = useCallback(() => {
    navigation.navigate('EventDetail', { event });
  }, [navigation, event]);

  const renderParticipateAction = useCallback(
    () => (
      <SwipeAction
        label="Participer"
        icon="check-circle"
        backgroundColor={participateColor}
        styles={styles}
      />
    ),
    [participateColor, styles],
  );

  const renderUnwishAction = useCallback(
    () => (
      <SwipeAction
        label="Retirer"
        icon="trash-2"
        backgroundColor={theme.colors.danger}
        styles={styles}
      />
    ),
    [theme.colors.danger, styles],
  );

  return (
    <Animated.View style={styles.rowWrapper} exiting={FadeOut.duration(160)}>
      <ReanimatedSwipeable
        ref={swipeRef}
        containerStyle={styles.swipeContainer}
        friction={1}
        overshootLeft={false}
        overshootRight={false}
        leftThreshold={ACTION_WIDTH * 0.6}
        rightThreshold={ACTION_WIDTH * 0.6}
        renderLeftActions={renderParticipateAction}
        renderRightActions={renderUnwishAction}
        onSwipeableOpen={(direction) => {
          void commit(direction === SwipeableSide.RIGHT ? 'right' : 'left');
        }}
      >
        <View style={styles.card}>
          {variant === 'B' && (
            <View style={[styles.edgeIndicator, { backgroundColor: participateColor }]} />
          )}

          <CardInfo
            event={event}
            styles={styles}
            typeColor={typeColor}
            typeBg={typeBg}
            greyColor={theme.colors.grey}
            onPress={openDetail}
          />

          {variant === 'A' && (
            <View style={styles.demoAActionsContainer}>
              <Pressable
                style={styles.participateButton}
                hitSlop={6}
                accessibilityRole="button"
                accessibilityLabel={`Participer à ${event.title}`}
                onPress={() => {
                  void commit('right');
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
                  void commit('left');
                }}
              >
                <Feather name="x" size={15} color={theme.colors.grey} />
              </Pressable>
            </View>
          )}

          {variant === 'B' && <View style={[styles.edgeIndicatorRight, styles.edgeIndicatorRed]} />}
        </View>
      </ReanimatedSwipeable>
    </Animated.View>
  );
}

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    rowWrapper: {
      marginBottom: 12,
    },
    swipeContainer: {
      position: 'relative',
      borderRadius: 18,
      overflow: 'hidden',
    },
    actionPanel: {
      width: ACTION_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
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
