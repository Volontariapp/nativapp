import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../user.api';
import { PROFILE_QUERY_KEY } from './use-profile';
import { Alert } from 'react-native';

export const useDeleteAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      Alert.alert(
        'Demande prise en compte',
        'Votre compte est en cours de suppression. Vous allez être déconnecté.',
      );
    },
    onError: (error) => {
      Alert.alert(
        'Erreur',
        error instanceof Error ? error.message : 'Impossible de supprimer le compte.',
      );
    },
  });
};
