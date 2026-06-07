import { useQuery } from '@tanstack/react-query';
import { postApi } from '../post.api';

const POST_QUERY_KEY = ['post'] as const;

export const useGetPost = (id: string) => {
  return useQuery({
    queryKey: [...POST_QUERY_KEY, id],
    queryFn: () => postApi.getPost(id),
    enabled: !!id,
  });
};
