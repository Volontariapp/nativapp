import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';

import type { AppEvent } from '@/api/event/event.api';
import EventCard from './EventCard';
import SwipeableCard from './SwipeableCard';

interface SwipeDeckProps {
  events: AppEvent[];
  currentIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
}

export default function SwipeDeck({
                                    events,
                                    currentIndex,
                                    onSwipe,
                                  }: SwipeDeckProps) {
  const visibleCards = events.slice(currentIndex, currentIndex + 3);

  return (
    <>
      {[...visibleCards]
        .reverse()
        .map((event, reversedIndex) => {
          const index = visibleCards.length - 1 - reversedIndex;

          const isTop = index === 0;

          const scale =
            index === 0 ? 1 : index === 1 ? 0.95 : 0.9;

          const translateY =
            index === 0 ? 0 : index === 1 ? 12 : 24;

          return (
            <Animated.View
              key={event.id}
              style={[
                styles.card,
                {
                  transform: [
                    { scale },
                    { translateY },
                  ],
                  opacity: index === 2 ? 0.8 : 1,
                  zIndex: 100 - index,
                },
              ]}
            >
              {isTop ? (
                <SwipeableCard onSwipe={onSwipe}>
                  <EventCard event={event} />
                </SwipeableCard>
              ) : (
                <EventCard event={event} />
              )}
            </Animated.View>
          );
        })}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: '100%',
  },
});
