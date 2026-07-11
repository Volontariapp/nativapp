import React, { useSyncExternalStore, Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/shared/themes/theme';
import type { AppMapProps } from './AppMap';
const LeafletMap = React.lazy(() => import('./LeafletMap.web'));

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function AppMap(props: AppMapProps) {
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
