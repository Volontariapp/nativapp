import { useMutation } from '@tanstack/react-query';
import { userApi } from '../user.api';
import { Alert } from 'react-native';

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: () => userApi.deleteMe(),
    onSuccess: () => {
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
