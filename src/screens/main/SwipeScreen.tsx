import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

import Swiper from 'react-native-deck-swiper';

import { AppText } from '@/components/typography/AppText';
import { EventCard } from '@/components/event/EventCard';
import { config } from '@/shared/config/base-config';
import AppHeader from '@/components/layout/AppHeader';
import { AppIconsButton } from '@/components';
import { theme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { useSwipeScreen } from './hooks/use-swipe-screen';

// ─── Sous-composants "State Views" ─────────────────────────────────────────

function SwipeLoadingView(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AppHeader showSettings />
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primaryEco}
          accessibilityLabel="Chargement des événements"
        />
        <AppText style={styles.message}>Chargement des événements...</AppText>
      </View>
    </View>
  );
}

function SwipeErrorView(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AppHeader showSettings />
      <View style={styles.center}>
        <AppText>Erreur lors du chargement.</AppText>
      </View>
    </View>
  );
}

function SwipeEmptyView(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AppHeader showSettings />
      <View style={styles.center}>
        <AppText variant="subtitle">Aucun événement disponible pour le moment.</AppText>
      </View>
    </View>
  );
}

function SwipeEndView(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <AppHeader showSettings />
      <View style={styles.center}>
        <AppText variant="subtitle">Plus d&apos;événement pour l&apos;instant.</AppText>
      </View>
    </View>
  );
}

function DelayedCardRender({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, config.swiper.delayMs);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
  }

  return <>{children}</>;
}

// ─── Composant Principal (Dumb Presenter) ──────────────────────────────────

export function SwipeScreen(): React.JSX.Element {
  const {
    events,
    isLoading,
    isError,
    isEndReached,
    currentIndex,
    userLocation,
    swiperRef,
    handleSwipeLeft,
    handleSwipeRight,
    handleTapCard,
    handleLocationPress,
  } = useSwipeScreen();

  if (isLoading) return <SwipeLoadingView />;
  if (isError) return <SwipeErrorView />;
  if (events.length === 0) return <SwipeEmptyView />;
  if (isEndReached) return <SwipeEndView />;

  return (
    <View style={styles.container}>
      <AppHeader showSettings />

      <View style={styles.contentWrapper}>
        <View style={styles.swiperContainer}>
          <Swiper<AppEvent>
            ref={swiperRef}
            cards={events}
            keyExtractor={(card: AppEvent) => card.id}
            renderCard={(event: AppEvent | undefined, index: number) => {
              if (!event) return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
              const isVisible = index >= currentIndex && index < currentIndex + 3;
              return (
                <View style={{ flex: 1, opacity: isVisible ? 1 : 0 }}>
                  <DelayedCardRender>
                    <EventCard
                      event={event}
                      userLocation={userLocation}
                      onLocationPress={handleLocationPress}
                    />
                  </DelayedCardRender>
                </View>
              );
            }}
            stackSize={3}
            stackScale={4}
            stackSeparation={18}
            backgroundColor="transparent"
            containerStyle={styles.swiperInner}
            animateOverlayLabelsOpacity
            disableTopSwipe
            disableBottomSwipe
            cardStyle={styles.card}
            cardVerticalMargin={0}
            cardHorizontalMargin={0}
            marginTop={0}
            marginBottom={70}
            onSwipedLeft={handleSwipeLeft}
            onSwipedRight={handleSwipeRight}
            onTapCard={handleTapCard}
            overlayLabels={{
              left: {
                title: 'NOPE',
                style: { label: styles.nopeLabel, wrapper: styles.nopeWrapper },
              },
              right: {
                title: 'LIKE',
                style: { label: styles.likeLabel, wrapper: styles.likeWrapper },
              },
            }}
          />
        </View>

        <View style={styles.buttonsContainer} pointerEvents="box-none">
          <View style={styles.floatingButton}>
            <AppIconsButton
              icon="x"
              size={64}
              variant="white"
              iconColor={theme.colors.danger}
              onPress={() => swiperRef.current?.swipeLeft()}
              accessibilityRole="button"
              accessibilityLabel="Passer cet événement"
            />
          </View>
          <View style={styles.floatingButton}>
            <AppIconsButton
              icon="heart"
              size={64}
              variant="white"
              iconColor={theme.colors.success}
              onPress={() => swiperRef.current?.swipeRight()}
              accessibilityRole="button"
              accessibilityLabel="Aimer cet événement"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────

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
    paddingTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: 20, // Leave some room at bottom
    zIndex: 1,
  },
  swiperInner: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  card: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent', // Override internal Swiper white background
    borderWidth: 0, // Override internal Swiper border
    elevation: 0, // Remove Android shadow
    shadowOpacity: 0, // Remove iOS shadow
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 40, // adjust to overlap halfway
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    zIndex: 2,
  },
  floatingButton: {
    ...theme.shadows.card,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.white,
  },
  message: {
    marginTop: theme.spacing.md,
  },
  likeWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginTop: -theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  likeLabel: {
    borderColor: theme.colors.success,
    color: theme.colors.success,
    borderWidth: 4,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    padding: theme.spacing.sm,
  },
  nopeWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    marginTop: -theme.spacing.sm,
    marginRight: -theme.spacing.sm,
  },
  nopeLabel: {
    borderColor: theme.colors.danger,
    color: theme.colors.danger,
    borderWidth: 4,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    padding: theme.spacing.sm,
  },
});
