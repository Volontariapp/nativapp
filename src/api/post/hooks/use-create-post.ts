import { Alert } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postApi } from '../post.api';
import type { CreatePostRequest } from '@volontariapp/contracts';

const POSTS_QUERY_KEY = ['posts'] as const;

export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostRequest) => postApi.createPost(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: POSTS_QUERY_KEY });
      Alert.alert('Succès', 'Le post a été créé avec succès !');
    },
    onError: (error) => {
      console.error('[useCreatePost] Mutation error:', error);
      Alert.alert('Erreur', 'Impossible de créer le post.');
    },
  });
};
