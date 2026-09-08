import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import Swiper from 'react-native-deck-swiper';

import { AppText } from '@/components/typography/AppText';
import { EventCard } from '@/components/event/EventCard';
import { config } from '@/shared/config/base-config';
import AppHeader from '@/components/layout/AppHeader';
import { AppIconsButton } from '@/components';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import type { AppEvent } from '@/api/event/event.api';
import { useSwipeScreen } from './hooks/use-swipe-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';

// ─── Sous-composants "State Views" ─────────────────────────────────────────

function SwipeLoadingView(): React.JSX.Element {
  const { theme, themeMode } = useAppTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.container}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <AppHeader showSettings dark={themeMode === 'dark'} />
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primaryEco}
          accessibilityLabel="Chargement des événements"
        />
        <AppText style={[styles.message, { color: theme.colors.text }]}>
          Chargement des événements...
        </AppText>
      </View>
    </View>
  );
}

function SwipeErrorView(): React.JSX.Element {
  const { theme, themeMode } = useAppTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.container}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <AppHeader showSettings dark={themeMode === 'dark'} />
      <View style={styles.center}>
        <AppText style={{ color: theme.colors.text }}>Erreur lors du chargement.</AppText>
      </View>
    </View>
  );
}

function SwipeEmptyView(): React.JSX.Element {
  const { theme, themeMode } = useAppTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.container}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <AppHeader showSettings dark={themeMode === 'dark'} />
      <View style={styles.center}>
        <AppText variant="subtitle" style={{ color: theme.colors.text }}>
          Aucun événement disponible pour le moment.
        </AppText>
      </View>
    </View>
  );
}

function SwipeEndView(): React.JSX.Element {
  const { theme, themeMode } = useAppTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.container}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <AppHeader showSettings dark={themeMode === 'dark'} />
      <View style={styles.center}>
        <AppText variant="subtitle" style={{ color: theme.colors.text }}>
          Plus d&apos;événement pour l&apos;instant.
        </AppText>
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
    userLocation,
    swiperRef,
    handleSwipeLeft,
    handleSwipeRight,
    handleTapCard,
    handleLocationPress,
  } = useSwipeScreen();

  const { theme, themeMode } = useAppTheme();
  const styles = useStyles(createStyles);

  const insets = useSafeAreaInsets();

  // Calculate total height of the bottom tab bar
  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 15) : insets.bottom;
  const tabBarHeight = Platform.OS === 'ios' ? 64 : 60;
  const safeBottomOffset = bottomInset + tabBarHeight;

  // The like/nope buttons will float right above the nav bar
  const buttonsBottom = safeBottomOffset + 10;
  // The cards should float above the buttons
  const swiperMarginBottom = buttonsBottom + 80;

  if (isLoading) return <SwipeLoadingView />;
  if (isError) return <SwipeErrorView />;
  if (events.length === 0) return <SwipeEmptyView />;
  if (isEndReached) return <SwipeEndView />;

  return (
    <View style={styles.container}>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <AppHeader showSettings dark={themeMode === 'dark'} />

      <View style={styles.contentWrapper}>
        <View style={styles.swiperContainer}>
          <Swiper<AppEvent>
            ref={swiperRef}
            cards={events}
            keyExtractor={(card: AppEvent) => card.id}
            renderCard={(event: AppEvent | undefined, _index: number) => {
              if (!event) return <View style={{ flex: 1, backgroundColor: 'transparent' }} />;
              return (
                <View style={{ flex: 1 }}>
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
            stackSize={4}
            stackScale={2}
            stackSeparation={20}
            backgroundColor="transparent"
            containerStyle={styles.swiperInner}
            animateOverlayLabelsOpacity
            disableTopSwipe
            disableBottomSwipe
            cardStyle={styles.card}
            cardVerticalMargin={0}
            cardHorizontalMargin={0}
            marginTop={0}
            marginBottom={swiperMarginBottom}
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

        <View style={[styles.buttonsContainer, { bottom: buttonsBottom }]} pointerEvents="box-none">
          <View style={[styles.floatingButton, { backgroundColor: theme.colors.white }]}>
            <AppIconsButton
              icon="x"
              size={64}
              variant="noBackground"
              iconColor={theme.colors.danger}
              onPress={() => swiperRef.current?.swipeLeft()}
              accessibilityRole="button"
              accessibilityLabel="Passer cet événement"
            />
          </View>
          <View style={[styles.floatingButton, { backgroundColor: theme.colors.white }]}>
            <AppIconsButton
              icon="heart"
              size={64}
              variant="noBackground"
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

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
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
      backgroundColor: 'transparent',
      borderWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
    },
    buttonsContainer: {
      position: 'absolute',
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
