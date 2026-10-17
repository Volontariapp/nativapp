import { View } from 'react-native';

// Les composants natifs de react-native-safe-area-context ne sont pas disponibles sous Jest.
export const SafeAreaView = View;
export const SafeAreaProvider = View;

export const useSafeAreaInsets = () => ({ top: 47, bottom: 34, left: 0, right: 0 });
