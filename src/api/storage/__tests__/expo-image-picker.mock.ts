// expo-image-picker pilote la galerie native: les tests remplacent ses deux appels par des jest.fn.
export const PermissionStatus = {
  UNDETERMINED: 'undetermined',
  GRANTED: 'granted',
  DENIED: 'denied',
} as const;

export const requestMediaLibraryPermissionsAsync = jest.fn();
export const launchImageLibraryAsync = jest.fn();
