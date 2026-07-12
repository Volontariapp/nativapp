import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../social.api';
import type { UserPublicProfile } from '@/api/user/user.api';

interface MyLikesData {
  ids: string[];
  totalCount: number;
}

interface PostLikersData {
  users: UserPublicProfile[];
  totalCount: number;
}

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => socialApi.unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post-likers', postId] });
      await queryClient.cancelQueries({ queryKey: ['my-likes'] });

      queryClient.setQueriesData<MyLikesData>({ queryKey: ['my-likes'] }, (old) => {
        if (!old) return { ids: [], totalCount: 0 };
        return {
          ...old,
          ids: old.ids.filter((id: string) => id !== postId),
          totalCount: Math.max(0, old.totalCount - 1),
        };
      });

      queryClient.setQueryData<PostLikersData>(['post-likers', postId, { limit: 1 }], (old) => {
        if (!old) return { users: [], totalCount: 0 };
        return { ...old, totalCount: Math.max(0, old.totalCount - 1) };
      });

      queryClient.setQueryData<PostLikersData>(['post-likers', postId, undefined], (old) => {
        if (!old) return { users: [], totalCount: 0 };
        return { ...old, totalCount: Math.max(0, old.totalCount - 1) };
      });
    },
    onError: (err, postId) => {
      void queryClient.invalidateQueries({ queryKey: ['post-likers', postId] });
      void queryClient.invalidateQueries({ queryKey: ['my-likes'] });
    },
  });
};
