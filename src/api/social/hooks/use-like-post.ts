/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { socialApi } from '../social.api';
import {
  cancelLikesSummary,
  invalidateLikesSummary,
  patchLikeSummary,
  restoreLikeSummary,
} from '../likes-summary.cache';
import type { PostLikeSummary } from '../likes-summary.types';
import type { UserPublicProfile } from '@/api/user/user.api';

interface MyLikesData {
  ids: string[];
  totalCount: number;
}

interface PostLikersData {
  users: UserPublicProfile[];
  totalCount: number;
}

interface LikeContext {
  previousSummary: PostLikeSummary | undefined;
}

export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, string, LikeContext>({
    mutationFn: (postId: string) => socialApi.likePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post-likers', postId] });
      await queryClient.cancelQueries({ queryKey: ['my-likes'] });
      await cancelLikesSummary(queryClient, postId);

      const previousSummary = patchLikeSummary(queryClient, postId, (current) =>
        current.likedByMe
          ? current
          : { ...current, likedByMe: true, likeCount: current.likeCount + 1 },
      );

      queryClient.setQueriesData<MyLikesData>({ queryKey: ['my-likes'] }, (old) => {
        if (!old) return { ids: [postId], totalCount: 1 };
        if (old.ids.includes(postId)) return old;
        return { ...old, ids: [...old.ids, postId], totalCount: (old.totalCount ?? 0) + 1 };
      });

      queryClient.setQueriesData<PostLikersData>({ queryKey: ['post-likers', postId] }, (old) => {
        if (!old) return { users: [], totalCount: 1 };
        return { ...old, totalCount: (old.totalCount ?? 0) + 1 };
      });

      return { previousSummary };
    },
    onError: (err: unknown, postId: string, context) => {
      const is409 =
        axios.isAxiosError(err) &&
        (err.response?.status === 409 ||
          JSON.stringify(err.response?.data).includes('ALREADY_EXISTS'));

      // Retour a l'etat d'avant l'optimiste, puis on rejoue le serveur comme source de verite.
      restoreLikeSummary(queryClient, postId, context?.previousSummary);

      if (is409) {
        // Deja like cote serveur : le like existe, mais notre +1 optimiste etait en trop.
        patchLikeSummary(queryClient, postId, (current) => ({ ...current, likedByMe: true }));
        queryClient.setQueriesData<MyLikesData>({ queryKey: ['my-likes'] }, (old) => {
          if (!old) return { ids: [postId], totalCount: 1 };
          if (old.ids.includes(postId)) return old;
          return { ...old, ids: [...old.ids, postId], totalCount: (old.totalCount ?? 0) + 1 };
        });
        invalidateLikesSummary(queryClient, postId);
        return;
      }

      console.error(`[useLikePost] Backend error for postId ${postId}:`, err);
      invalidateLikesSummary(queryClient, postId);
      void queryClient.invalidateQueries({ queryKey: ['post-likers', postId] });
      void queryClient.invalidateQueries({ queryKey: ['my-likes'] });
    },
  });
};
