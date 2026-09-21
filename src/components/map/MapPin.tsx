import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Marker,
  type MapMarkerProps,
  type MarkerPressEvent,
  type MarkerSelectEvent,
} from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '@/shared/themes/theme';

export interface CustomMarkerProps extends Omit<MapMarkerProps, 'children'> {
  color?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  size?: number;
}

export const CustomMarker: React.FC<CustomMarkerProps> = ({
  coordinate,
  title,
  description,
  color,
  pinColor,
  iconName = 'calendar-outline',
  size = 40,
  onPress,
  onSelect,
  ...rest
}) => {
  const markerColor = color ?? pinColor ?? theme.colors.primaryEco;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const lastPressRef = useRef(0);

  // Permet au marker de se dessiner au 1er rendu avant de figer la vue pour les performances
  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [coordinate.latitude, coordinate.longitude, markerColor, iconName, size]);

  const handlePress = useCallback(
    (e: MarkerPressEvent | MarkerSelectEvent) => {
      e.stopPropagation();
      const now = Date.now();
      if (now - lastPressRef.current < 250) {
        return;
      }
      lastPressRef.current = now;
      onPress?.(e as MarkerPressEvent);
      onSelect?.(e as MarkerSelectEvent);
    },
    [onPress, onSelect],
  );

  const totalHeight = size + 6;

  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      onPress={handlePress}
      onSelect={handlePress}
      stopPropagation
      anchor={{ x: 0.5, y: 1 }}
      centerOffset={{ x: 0, y: -totalHeight / 2 }}
      tracksViewChanges={tracksViewChanges}
      {...rest}
    >
      <View style={[styles.container, { width: size, height: totalHeight }]}>
        <View
          style={[
            styles.bubble,
            {
              backgroundColor: markerColor,
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
        >
          <Ionicons name={iconName} size={size * 0.5} color={theme.colors.white} />
        </View>

        {/* Pointe vers le bas */}
        <View style={[styles.arrow, { borderTopColor: markerColor }]} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 0,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2, // Évite un interstice entre le rond et la pointe
  },
});