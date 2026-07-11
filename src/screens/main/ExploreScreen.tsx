import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AppText } from '@/components/typography/AppText';
import AppHeader from '@/components/layout/AppHeader';
import { theme } from '@/shared/themes/theme';
import { AppMap, MapProvider } from '@/components/map';
import { useGetEvents } from '@/api/event/hooks/use-get-events';
import type { MainStackParamList } from '@/navigation/stacks/MainStack';
import type { AppEvent } from '@/api/event/event.api';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

type ExploreRouteParams = {
  initialLocation?: { latitude: number; longitude: number };
};

export function ExploreScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<{ params: ExploreRouteParams }, 'params'>>();
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const initialLocation = route.params?.initialLocation;
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: eventsData, isLoading } = useGetEvents({
    excludeCreatedByMe: true,
  });

  useEffect(() => {
    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  const handleMarkerPress = (event: AppEvent) => {
    navigation.navigate('EventDetail', { event });
  };

  return (
    <View style={styles.container}>
      <AppHeader showSettings />

      {errorMsg != null && (
        <View style={styles.errorContainer}>
          <AppText style={styles.errorText}>{errorMsg}</AppText>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primarySocio} />
        </View>
      ) : (
        <MapProvider>
          <AppMap
            key={
              initialLocation
                ? `map-${String(initialLocation.latitude)}-${String(initialLocation.longitude)}`
                : 'map-default'
            }
            initialCenter={initialLocation}
            userLocation={
              location
                ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
                : undefined
            }
            events={eventsData ? eventsData.pages.flatMap((page) => page.events) : []}
            onMarkerPress={handleMarkerPress}
          />
        </MapProvider>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.danger,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    zIndex: 100,
  },
  errorText: {
    color: theme.colors.white,
    textAlign: 'center',
  },
});
