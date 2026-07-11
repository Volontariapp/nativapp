import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';

import Swiper from 'react-native-deck-swiper';

import { AppText } from '@/components/typography/AppText';
import EventCard from '@/components/event/EventCard';
import AppHeader from '@/components/layout/AppHeader';

import { useGetEvents } from '@/api/event/hooks/use-get-events';

import { theme } from '@/shared/themes/theme';
import { AppIconsButton } from '@/components';
import type { AppEvent } from '@/api/event/event.api';
import { useUserSocialActions } from '@/api/social/hooks/use-user-social-actions';

enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

export function SwipeScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetEvents(
    { limit: 10, excludeCreatedByMe: true, excludeWishedByMe: true },
  );

  const { wish } = useUserSocialActions();

  const swiperRef = useRef<Swiper<AppEvent>>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);

  React.useEffect(() => {
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setUserLocation(loc);
    })();
  }, []);

  const events = useMemo(() => data?.pages.flatMap((page) => page.events) ?? [], [data]);

  const isEndReached = currentIndex >= events.length && !hasNextPage && !isFetchingNextPage;

  const handleSwipe = useCallback(
    (direction: SwipeDirection, cardIndex: number) => {
      const nextIndex = cardIndex + 1;

      console.log('Direction :', direction, '| Event :', events[cardIndex]?.title);

      if (direction === SwipeDirection.RIGHT && cardIndex < events.length) {
        void wish(events[cardIndex].id);
      }

      setCurrentIndex(nextIndex);

      if (nextIndex + 3 >= events.length && hasNextPage && !isFetchingNextPage) {
        console.log('Fetching next page...');
        void fetchNextPage();
      }
    },
    [events, hasNextPage, isFetchingNextPage, fetchNextPage, wish],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <AppHeader showSettings />

        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.primaryEco} />

          <AppText style={styles.message}>Chargement des événements...</AppText>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <AppHeader showSettings />

        <View style={styles.center}>
          <AppText>Erreur lors du chargement.</AppText>
        </View>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <AppHeader showSettings />

        <View style={styles.center}>
          <AppText variant="subtitle">Aucun événement disponible pour le moment.</AppText>
        </View>
      </View>
    );
  }

  if (isEndReached) {
    return (
      <View style={styles.container}>
        <AppHeader showSettings />

        <View style={styles.center}>
          <AppText variant="subtitle">Plus d'événement pour l'instant.</AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppHeader showSettings />

      <View style={styles.contentWrapper}>
        <View style={styles.swiperContainer}>
          <Swiper
            ref={swiperRef}
            cards={events}
            cardIndex={currentIndex}
            renderCard={(event) => (
              <EventCard
                event={event}
                userLocation={userLocation}
                onLocationPress={() => {
                  if (event.location) {
                    // @ts-expect-error: By-passing type check for tab nested navigation
                    navigation.navigate('explorer', {
                      initialLocation: event.location,
                    });
                  }
                }}
              />
            )}
            stackSize={4}
            stackScale={5}
            stackSeparation={20}
            backgroundColor="transparent"
            containerStyle={{ flex: 1, backgroundColor: 'transparent' }}
            animateOverlayLabelsOpacity
            animateCardOpacity
            disableTopSwipe
            disableBottomSwipe
            cardStyle={{ top: 0, left: 0, bottom: 0, right: 0, width: '100%', height: '100%' }}
            cardVerticalMargin={0}
            cardHorizontalMargin={0}
            marginTop={0}
            marginBottom={0}
            onSwipedLeft={(index) => {
              handleSwipe(SwipeDirection.LEFT, index);
            }}
            onSwipedRight={(index) => {
              handleSwipe(SwipeDirection.RIGHT, index);
            }}
            onTapCard={(index) => {
              const event = events[index];
              navigation.navigate('EventDetail', { event });
            }}
            overlayLabels={{
              left: {
                title: 'PASS',
                style: {
                  label: styles.nopeLabel,
                  wrapper: styles.nopeWrapper,
                },
              },
              right: {
                title: 'LIKE',
                style: {
                  label: styles.likeLabel,
                  wrapper: styles.likeWrapper,
                },
              },
            }}
          />
        </View>

        <View style={styles.separatorContainer}>
          <View style={styles.separator} />
        </View>

        <View style={styles.buttonsContainer}>
          <AppIconsButton
            icon="x"
            size={80}
            variant="danger"
            onPress={() => swiperRef.current?.swipeLeft()}
          />

          <AppIconsButton icon="heart" size={80} onPress={() => swiperRef.current?.swipeRight()} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  contentWrapper: {
    flex: 1,
  },

  swiperContainer: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 20,
    paddingBottom: 15,
    zIndex: 1,
  },

  separatorContainer: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },

  separator: {
    height: 2,
    backgroundColor: theme.colors.lightGrey,
    borderRadius: 2,
  },

  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 50,
    paddingBottom: 30,
    paddingTop: 10,
  },

  message: {
    marginTop: theme.spacing.md,
  },

  likeWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: -10,
    marginLeft: -10,
  },

  likeLabel: {
    borderColor: theme.colors.success,
    color: theme.colors.success,
    borderWidth: 4,
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    padding: 10,
  },

  nopeWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: -10,
    marginRight: -10,
  },

  nopeLabel: {
    borderColor: theme.colors.danger,
    color: theme.colors.danger,
    borderWidth: 4,
    fontSize: 32,
    fontWeight: theme.typography.fontWeight.bold,
    padding: 10,
  },
});
