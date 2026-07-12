/* eslint-disable @typescript-eslint/no-unnecessary-condition */
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

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => socialApi.likePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post-likers', postId] });
      await queryClient.cancelQueries({ queryKey: ['my-likes'] });

      // Exact match for my-likes in AppPost
      queryClient.setQueryData<MyLikesData>(['my-likes', undefined], (old) => {
        if (!old) return { ids: [postId], totalCount: 1 };
        if (old.ids.includes(postId)) return old;
        return { ...old, ids: [...old.ids, postId], totalCount: (old.totalCount ?? 0) + 1 };
      });

      // Exact match for the query in AppPost
      queryClient.setQueryData<PostLikersData>(['post-likers', postId, { limit: 1 }], (old) => {
        if (!old) return { users: [], totalCount: 1 };
        return { ...old, totalCount: (old.totalCount ?? 0) + 1 };
      });

      // Exact match for the query in the modal
      queryClient.setQueryData<PostLikersData>(['post-likers', postId, undefined], (old) => {
        if (!old) return { users: [], totalCount: 1 };
        return { ...old, totalCount: (old.totalCount ?? 0) + 1 };
      });
    },
    onError: (err, postId) => {
      console.error(`[useLikePost] Backend error for postId ${postId}:`, err);
      void queryClient.invalidateQueries({ queryKey: ['post-likers', postId] });
      void queryClient.invalidateQueries({ queryKey: ['my-likes'] });
    },
  });
};
