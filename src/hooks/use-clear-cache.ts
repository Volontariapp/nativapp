import { useState } from 'react';
import { Alert } from 'react-native';
import { Image } from 'expo-image';
import { useQueryClient } from '@tanstack/react-query';

interface UseClearCacheResult {
  isClearing: boolean;
  clearCache: () => Promise<void>;
}

/** Vide le cache des requêtes (React Query) et le cache d'images (mémoire + disque). */
export const useClearCache = (): UseClearCacheResult => {
  const queryClient = useQueryClient();
  const [isClearing, setIsClearing] = useState(false);

  const clearCache = async (): Promise<void> => {
    setIsClearing(true);
    try {
      await Promise.all([
        queryClient.resetQueries(),
        Image.clearMemoryCache(),
        Image.clearDiskCache(),
      ]);
      Alert.alert('Cache vidé', 'Les données temporaires ont été supprimées.');
    } catch (error) {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible de vider le cache.',
      );
    } finally {
      setIsClearing(false);
    }
  };

  return { isClearing, clearCache };
};
