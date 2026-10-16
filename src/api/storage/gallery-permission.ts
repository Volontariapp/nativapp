import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

/** Demande l'accès à la galerie ; affiche un message et renvoie false si l'utilisateur refuse. */
export const ensureGalleryPermission = async (): Promise<boolean> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status === ImagePicker.PermissionStatus.GRANTED) {
    return true;
  }
  Alert.alert(
    'Permission refusée',
    'Nous avons besoin de votre permission pour accéder à vos photos.',
  );
  return false;
};
