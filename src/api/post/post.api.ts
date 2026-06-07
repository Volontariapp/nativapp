import { apiFetch } from '../client';
import { POST_ENDPOINTS, SOCIAL_ENDPOINTS } from '../endpoints';
import type {
  CreatePostRequest,
  GetPostResponse,
  Post,
  ListPostsResponse,
} from '@volontariapp/contracts';
import type { IdsListWebResponse } from '@/api/endpoints';

export const postApi = {
  async createPost(payload: CreatePostRequest): Promise<Post> {
    try {
      console.log('[postApi.createPost] Sending payload:', payload);
      const response = await apiFetch<GetPostResponse, CreatePostRequest>(
        POST_ENDPOINTS.CREATE_POST.path,
        {
          method: POST_ENDPOINTS.CREATE_POST.method,
          requiresAuth: POST_ENDPOINTS.CREATE_POST.requiresAuth,
          body: payload,
        },
      );

      console.log('[postApi.createPost] Received response:', response);

      if (response.post === undefined) {
        throw new Error('Post data not found');
      }

      return response.post;
    } catch (error) {
      console.error('[postApi.createPost] Error details:', error);
      throw error;
    }
  },

  async getMyPosts(params: {
    page?: number;
    limit?: number;
  }): Promise<{ postIds: string[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.path}?${queryString}`
      : SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.path;

    const response = await apiFetch<IdsListWebResponse>(path, {
      method: SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.method,
      requiresAuth: SOCIAL_ENDPOINTS.GET_USER_POSTS_SELF.requiresAuth,
    });

    return {
      postIds: response.ids,
      totalCount: response.ids.length,
    };
  },

  async listPosts(params: {
    authorId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ posts: Post[]; totalCount: number }> {
    const query = new URLSearchParams();
    if (params.authorId !== undefined) query.append('authorId', params.authorId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${POST_ENDPOINTS.LIST_POSTS.path}?${queryString}`
      : POST_ENDPOINTS.LIST_POSTS.path;

    const response = await apiFetch<ListPostsResponse>(path, {
      method: POST_ENDPOINTS.LIST_POSTS.method,
      requiresAuth: POST_ENDPOINTS.LIST_POSTS.requiresAuth,
    });

    return {
      posts: response.posts,
      totalCount: response.pagination?.total ?? (response.posts.length),
    };
  },

  async getPost(id: string): Promise<Post> {
    const path = POST_ENDPOINTS.GET_POST.path.replace(':id', id);
    const response = await apiFetch<GetPostResponse>(path, {
      method: POST_ENDPOINTS.GET_POST.method,
      requiresAuth: POST_ENDPOINTS.GET_POST.requiresAuth,
    });

    if (response.post === undefined) {
      throw new Error('Post not found');
    }

    return response.post;
  },
};
