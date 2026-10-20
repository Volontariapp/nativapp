/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
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

      queryClient.setQueriesData<MyLikesData>({ queryKey: ['my-likes'] }, (old) => {
        if (!old) return { ids: [postId], totalCount: 1 };
        if (old.ids.includes(postId)) return old;
        return { ...old, ids: [...old.ids, postId], totalCount: (old.totalCount ?? 0) + 1 };
      });

      queryClient.setQueriesData<PostLikersData>({ queryKey: ['post-likers', postId] }, (old) => {
        if (!old) return { users: [], totalCount: 1 };
        return { ...old, totalCount: (old.totalCount ?? 0) + 1 };
      });
    },
    onError: (err: unknown, postId: string) => {
      const is409 =
        axios.isAxiosError(err) &&
        (err.response?.status === 409 ||
          JSON.stringify(err.response?.data).includes('ALREADY_EXISTS'));

      if (is409) {
        queryClient.setQueriesData<MyLikesData>({ queryKey: ['my-likes'] }, (old) => {
          if (!old) return { ids: [postId], totalCount: 1 };
          if (old.ids.includes(postId)) return old;
          return { ...old, ids: [...old.ids, postId], totalCount: (old.totalCount ?? 0) + 1 };
        });
        return;
      }

      console.error(`[useLikePost] Backend error for postId ${postId}:`, err);
      void queryClient.invalidateQueries({ queryKey: ['post-likers', postId] });
      void queryClient.invalidateQueries({ queryKey: ['my-likes'] });
    },
  });
};
