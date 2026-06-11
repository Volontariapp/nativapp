import { apiFetch } from '../client';
import { POST_ENDPOINTS } from '../endpoints/post.endpoints';
import type {
  CreatePostRequest,
  CreatePostWebResponse,
  ListPostsWebResponse,
  ActionSuccessWebResponse, ListPostsResponse,
} from '@volontariapp/contracts';

export const postApi = {
  async createPost(payload: CreatePostRequest): Promise<CreatePostWebResponse> {
    try {
      console.log('[postApi.createPost] Sending payload:', payload);

      const response = await apiFetch<CreatePostWebResponse, CreatePostRequest>(
        POST_ENDPOINTS.CREATE_POST.path,
        {
          method: POST_ENDPOINTS.CREATE_POST.method,
          requiresAuth: POST_ENDPOINTS.CREATE_POST.requiresAuth,
          body: payload,
        },
      );
      console.log('[postApi.createPost] Received response:', response);
      return response;
    } catch (error) {
      console.error(
        '[postApi.createPost] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async deletePost(id: string): Promise<ActionSuccessWebResponse> {
    try {
      const path = POST_ENDPOINTS.DELETE_POST.path.replace(':id', id);

      const response = await apiFetch<ActionSuccessWebResponse>(path, {
        method: POST_ENDPOINTS.DELETE_POST.method,
        requiresAuth: POST_ENDPOINTS.DELETE_POST.requiresAuth,
      });
      return response;
    } catch (error) {
      console.error(
        '[postApi.deletePost] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },

  async listPosts(params: {
    authorId?: string;
    page?: number;
    limit?: number;
  }): Promise<ListPostsWebResponse> {
    const query = new URLSearchParams();
    if (params.authorId !== undefined) query.append('authorId', params.authorId);
    if (params.page !== undefined) query.append('page', params.page.toString());
    if (params.limit !== undefined) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    const path = queryString
      ? `${POST_ENDPOINTS.LIST_POSTS.path}?${queryString}`
      : POST_ENDPOINTS.LIST_POSTS.path;

    const response = await apiFetch<ListPostsWebResponse>(path, {
      method: POST_ENDPOINTS.LIST_POSTS.method,
      requiresAuth: POST_ENDPOINTS.LIST_POSTS.requiresAuth,
    });

    return response;
  },

  async getMyPosts(params: {
    page?: number;
    limit?: number;
    authorId: string;
  }): Promise<ListPostsWebResponse> {
    try {
      const query = new URLSearchParams();
      if (params.page !== undefined) query.append('page', params.page.toString());
      if (params.limit !== undefined) query.append('limit', params.limit.toString());
      if (params.authorId) query.append('authorId', params.authorId);

      const queryString = query.toString();
      const path = queryString
        ? `${POST_ENDPOINTS.LIST_POSTS.path}?${queryString}`
        : POST_ENDPOINTS.LIST_POSTS.path;

      console.log(`[FRONTEND_DEBUG] getMyPosts params:`, params);
      console.log(`[FRONTEND_DEBUG] getMyPosts query toString:`, query.toString());
      console.log(`[FRONTEND_DEBUG] getMyPosts final path:`, path);

      const response = await apiFetch<ListPostsWebResponse>(path, {
        method: POST_ENDPOINTS.LIST_POSTS.method,
        requiresAuth: POST_ENDPOINTS.LIST_POSTS.requiresAuth,
      });

      return response;
    } catch (error) {
      console.error(
        '[postApi.getMyPosts] Error details:',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  },
};
