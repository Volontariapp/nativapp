import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../user.api';
import type { UpdateUserRequest } from '@volontariapp/contracts';
import { Alert } from 'react-native';

const PROFILE_QUERY_KEY = ['profile'] as const;

/**
 * Hook pour mettre à jour les informations du profil utilisateur.
 * Invalide le cache du profil après une mise à jour réussie.
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserRequest) => userApi.updateMe(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      Alert.alert('Succès', 'Ton profil a été mis à jour avec succès !');
    },
    onError: (error) => {
      Alert.alert('Erreur', error instanceof Error ? error.message : 'Impossible de mettre à jour le profil.');
    },
  });
};
