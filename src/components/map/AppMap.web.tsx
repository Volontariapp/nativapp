import React, { useState, useEffect, Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import type { AppMapProps } from './AppMap';

// Dynamically import LeafletMap to avoid Server-Side Rendering (SSR) crashes
// and "window is not defined" errors during Expo Static Web Builds.
const LeafletMap = React.lazy(() => import('./LeafletMap.web'));

export function AppMap(props: AppMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || typeof window === 'undefined') {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.text}>Chargement de la carte...</Text>
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View style={styles.placeholder}>
          <Text style={styles.text}>Chargement de la carte...</Text>
        </View>
      }
    >
      <LeafletMap {...props} />
    </Suspense>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    backgroundColor: theme.colors.lightGrey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: theme.colors.grey,
  },
});
