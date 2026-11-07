import * as Location from 'expo-location';

export const createMockPermissionResponse = (
  granted: boolean,
): Location.LocationPermissionResponse => ({
  status: granted ? Location.PermissionStatus.GRANTED : Location.PermissionStatus.DENIED,
  granted,
  canAskAgain: !granted,
  expires: 'never',
});

export const createMockLocationObject = (
  latitude: number,
  longitude: number,
): Location.LocationObject => ({
  coords: {
    latitude,
    longitude,
    altitude: null,
    accuracy: 5,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: 0,
});
