import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import AppMap from '@/components/map/AppMap';
import { MapProvider } from '@/components/map/MapContext';
import { EventMapPrevue } from '@/components/event/EventMapPrevue';
import { MapFilterBar } from '@/components/map/MapFilterBar';
import { useAppTheme, useStyles } from '@/context/ThemeContext';
import type { AppTheme } from '@/shared/themes/theme';
import { useExploreScreen } from './hooks/use-explore-screen';

export const ExploreScreen = React.memo(function ExploreScreen(): React.JSX.Element {
  const { theme } = useAppTheme();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();

  const {
    events,
    isLoading,
    userCoordinates,
    initialLocation,
    mapKey,
    isPermissionDenied,
    selectedEvent,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedDistance,
    setSelectedDistance,
    selectedDate,
    setSelectedDate,
    handleMarkerPress,
    handleOpenEvent,
    handleClosePrevue,
    handleMapPress,
  } = useExploreScreen();

  return (
    <View style={styles.container}>
      <AppHeader showSettings />

      {isPermissionDenied && (
        <View style={[styles.errorContainer, { top: insets.top + theme.spacing.sm }]}>
          <AppText style={styles.errorText}>Permission de localisation refusée.</AppText>
        </View>
      )}

      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonMap} />
        </View>
      ) : (
        <MapProvider>
          <View style={styles.mapContainer}>
            <AppMap
              key={mapKey}
              initialCenter={initialLocation}
              userLocation={userCoordinates ?? undefined}
              events={events}
              onMarkerPress={handleMarkerPress}
              onMapPress={handleMapPress}
              hasBottomPreview={Boolean(selectedEvent)}
            />

            <MapFilterBar
              style={styles.filterBar}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              distanceKm={selectedDistance}
              onDistanceChange={setSelectedDistance}
              dateFilter={selectedDate}
              onDateChange={setSelectedDate}
            />

            {selectedEvent && (
              <EventMapPrevue
                event={selectedEvent}
                onOpen={handleOpenEvent}
                onClose={handleClosePrevue}
              />
            )}
          </View>
        </MapProvider>
      )}
    </View>
  );
});

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    skeletonContainer: {
      flex: 1,
    },
    mapContainer: {
      flex: 1,
      position: 'relative',
    },
    filterBar: {
      position: 'absolute',
      top: 14,
      left: 16,
      right: 16,
      alignSelf: 'center',
      zIndex: 1100,
      maxWidth: 380,
    },
    skeletonMap: {
      flex: 1,
      backgroundColor: theme.colors.skeletonGrey,
      opacity: 0.3, // Effet de base pour le chargement
    },
    errorContainer: {
      position: 'absolute',
      left: theme.spacing.lg,
      right: theme.spacing.lg,
      backgroundColor: theme.colors.danger,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      zIndex: 100,
      ...theme.shadows.card,
    },
    errorText: {
      color: theme.colors.white,
      textAlign: 'center',
      fontWeight: theme.typography.fontWeight.bold,
      fontSize: theme.typography.fontSize.sm,
    },
  });
