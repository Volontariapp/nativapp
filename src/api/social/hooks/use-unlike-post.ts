import { useMutation, useQueryClient } from '@tanstack/react-query';
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

interface UnlikeContext {
  previousSummary: PostLikeSummary | undefined;
}

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, string, UnlikeContext>({
    mutationFn: (postId: string) => socialApi.unlikePost(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ['post-likers', postId] });
      await queryClient.cancelQueries({ queryKey: ['my-likes'] });
      await cancelLikesSummary(queryClient, postId);

      const previousSummary = patchLikeSummary(queryClient, postId, (current) =>
        current.likedByMe
          ? { ...current, likedByMe: false, likeCount: Math.max(0, current.likeCount - 1) }
          : current,
      );

      queryClient.setQueriesData<MyLikesData>({ queryKey: ['my-likes'] }, (old) => {
        if (!old) return { ids: [], totalCount: 0 };
        return {
          ...old,
          ids: old.ids.filter((id: string) => id !== postId),
          totalCount: Math.max(0, old.totalCount - 1),
        };
      });

      queryClient.setQueriesData<PostLikersData>({ queryKey: ['post-likers', postId] }, (old) => {
        if (!old) return { users: [], totalCount: 0 };
        return { ...old, totalCount: Math.max(0, old.totalCount - 1) };
      });

      return { previousSummary };
    },
    onError: (_err, postId, context) => {
      restoreLikeSummary(queryClient, postId, context?.previousSummary);
      invalidateLikesSummary(queryClient, postId);
      void queryClient.invalidateQueries({ queryKey: ['post-likers', postId] });
      void queryClient.invalidateQueries({ queryKey: ['my-likes'] });
    },
  });
};
