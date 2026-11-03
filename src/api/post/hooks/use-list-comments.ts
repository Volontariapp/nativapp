import { useQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';

import { COMMENTS_LIST_QUERY_KEY } from '../comments-query-keys';

export { COMMENTS_LIST_QUERY_KEY };

export function useListComments(
  postId: string,
  params: { page?: number; limit?: number } = { limit: 10, page: 1 },
) {
  return useQuery({
    queryKey: [...COMMENTS_LIST_QUERY_KEY, postId, params],
    queryFn: () => postApi.listComments(postId, params),
    enabled: !!postId,
  });
}
