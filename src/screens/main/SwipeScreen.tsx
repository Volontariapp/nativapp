import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import Swiper from 'react-native-deck-swiper';

import { AppText } from '@/components/typography/AppText';
import EventCard from '@/components/event/EventCard';

import { useGetMyEvents } from '@/api/event/hooks/use-get-my-events';

import { theme } from '@/shared/themes/theme';
import { AppIconsButton } from '@/components';
import type {AppEvent} from "@/api/event/event.api";

enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

export function SwipeScreen(): React.JSX.Element {
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useGetMyEvents(10);

  const swiperRef = useRef<Swiper<AppEvent>>(null);

  const [currentIndex, setCurrentIndex] = useState(0);

  const events = useMemo(
    () => data?.pages.flatMap((page) => page.events) ?? [],
    [data],
  );

  const isEndReached =
    currentIndex >= events.length &&
    !hasNextPage &&
    !isFetchingNextPage;

  const handleSwipe = useCallback(
    (direction: SwipeDirection, cardIndex: number) => {
      const nextIndex = cardIndex + 1;

      console.log(
        'Direction :',
        direction,
        '| Event :',
        events[cardIndex]?.title,
      );

      setCurrentIndex(nextIndex);

      if (
        nextIndex + 3 >= events.length && hasNextPage &&
        !isFetchingNextPage
      ) {
        console.log('Fetching next page...');
        void fetchNextPage();
      }
    },
    [
      events,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    ],
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <AppText variant="title">Découverte</AppText>
          <AppText variant="subtitle">Éco & Social</AppText>
        </View>

        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primaryEco}
          />

          <AppText style={styles.message}>
            Chargement des événements...
          </AppText>
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <AppText variant="title">Découverte</AppText>
          <AppText variant="subtitle">Éco & Social</AppText>
        </View>

        <View style={styles.center}>
          <AppText>
            Erreur lors du chargement.
          </AppText>
        </View>
      </View>
    );
  }

  if (events.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <AppText variant="title">Découverte</AppText>
          <AppText variant="subtitle">Éco & Social</AppText>
        </View>

        <View style={styles.center}>
          <AppText variant="subtitle">
            Aucun événement disponible pour le moment.
          </AppText>
        </View>
      </View>
    );
  }

  if (isEndReached) {
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <AppText variant="title">Découverte</AppText>
          <AppText variant="subtitle">Éco & Social</AppText>
        </View>

        <View style={styles.center}>
          <AppText variant="subtitle">
            Plus d'événement pour l'instant.
          </AppText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.title}>
        <AppText variant="title">Découverte</AppText>
        <AppText variant="subtitle">Éco & Social</AppText>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={events}
          cardIndex={currentIndex}
          renderCard={(event) => <EventCard event={event} />}
          stackSize={4}
          stackScale={4}
          stackSeparation={14}
          backgroundColor="transparent"
          animateOverlayLabelsOpacity
          animateCardOpacity
          disableTopSwipe
          disableBottomSwipe
          onSwipedLeft={(index) =>
            { handleSwipe(SwipeDirection.LEFT, index); }
          }
          onSwipedRight={(index) =>
            { handleSwipe(SwipeDirection.RIGHT, index); }
          }
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

      <View style={styles.buttons}>
        <AppIconsButton
          icon="x"
          size={80}
          variant="danger"
          onPress={() => swiperRef.current?.swipeLeft()}
        />

        <AppIconsButton
          icon="heart"
          size={80}
          onPress={() => swiperRef.current?.swipeRight()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  title: {
    marginTop: theme.spacing.md,
    alignItems: 'center',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  swiperContainer: {
    flex: 1,
  },

  buttons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingHorizontal: 50,
    marginTop: 100,
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
