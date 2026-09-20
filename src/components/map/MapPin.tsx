import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker, type MapMarkerProps } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons'; // ou Lucide / React Native Vector Icons
import { theme } from '@/shared/themes/theme';

interface CustomMarkerProps extends Omit<MapMarkerProps, 'children'> {
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
  ...rest
}) => {
  const markerColor = color ?? pinColor ?? theme.colors.primaryEco;
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  // Permet au marker de se dessiner au 1er rendu avant de figer la vue pour les performances
  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [coordinate, markerColor, iconName, size]);

  return (
    <Marker
      coordinate={coordinate}
      title={title}
      description={description}
      onPress={onPress}
      anchor={{ x: 0.5, y: 1 }}
      tracksViewChanges={tracksViewChanges}
      {...rest}
    >
      <View style={[styles.container, { width: size, height: size + 8 }]}>
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
    justifyContent: 'center',
    // Ombre iOS
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    // Ombre Android
    elevation: 6,
  },
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.white,
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