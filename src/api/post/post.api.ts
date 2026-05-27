import { apiFetch } from '../client';
import { POST_ENDPOINTS } from '../endpoints/post.endpoints';

// Types inférés depuis EndpointDefinition
type Req<T> = T extends { _req?: infer R } ? R : never;
type Res<T> = T extends { _res?: infer R } ? R : never;

export const postApi = {
  async listPosts(
    payload: Req<typeof POST_ENDPOINTS.LIST_POSTS>,
  ): Promise<Res<typeof POST_ENDPOINTS.LIST_POSTS>> {
    return apiFetch<Res<typeof POST_ENDPOINTS.LIST_POSTS>, Req<typeof POST_ENDPOINTS.LIST_POSTS>>(
      POST_ENDPOINTS.LIST_POSTS.path,
      {
        method: POST_ENDPOINTS.LIST_POSTS.method,
        requiresAuth: POST_ENDPOINTS.LIST_POSTS.requiresAuth,
        body: POST_ENDPOINTS.LIST_POSTS.method !== 'GET' ? payload : undefined,
      },
    );
  },

  async getPost(
    payload: Req<typeof POST_ENDPOINTS.GET_POST>,
  ): Promise<Res<typeof POST_ENDPOINTS.GET_POST>> {
    return apiFetch<Res<typeof POST_ENDPOINTS.GET_POST>, Req<typeof POST_ENDPOINTS.GET_POST>>(
      POST_ENDPOINTS.GET_POST.path,
      {
        method: POST_ENDPOINTS.GET_POST.method,
        requiresAuth: POST_ENDPOINTS.GET_POST.requiresAuth,
        body: POST_ENDPOINTS.GET_POST.method !== 'GET' ? payload : undefined,
      },
    );
  },

  async createPost(
    payload: Req<typeof POST_ENDPOINTS.CREATE_POST>,
  ): Promise<Res<typeof POST_ENDPOINTS.CREATE_POST>> {
    return apiFetch<Res<typeof POST_ENDPOINTS.CREATE_POST>, Req<typeof POST_ENDPOINTS.CREATE_POST>>(
      POST_ENDPOINTS.CREATE_POST.path,
      {
        method: POST_ENDPOINTS.CREATE_POST.method,
        requiresAuth: POST_ENDPOINTS.CREATE_POST.requiresAuth,
        body: POST_ENDPOINTS.CREATE_POST.method !== 'GET' ? payload : undefined,
      },
    );
  },

  async updatePost(
    payload: Req<typeof POST_ENDPOINTS.UPDATE_POST>,
  ): Promise<Res<typeof POST_ENDPOINTS.UPDATE_POST>> {
    return apiFetch<Res<typeof POST_ENDPOINTS.UPDATE_POST>, Req<typeof POST_ENDPOINTS.UPDATE_POST>>(
      POST_ENDPOINTS.UPDATE_POST.path,
      {
        method: POST_ENDPOINTS.UPDATE_POST.method,
        requiresAuth: POST_ENDPOINTS.UPDATE_POST.requiresAuth,
        body: POST_ENDPOINTS.UPDATE_POST.method !== 'GET' ? payload : undefined,
      },
    );
  },

  async deletePost(
    payload: Req<typeof POST_ENDPOINTS.DELETE_POST>,
  ): Promise<Res<typeof POST_ENDPOINTS.DELETE_POST>> {
    return apiFetch<Res<typeof POST_ENDPOINTS.DELETE_POST>, Req<typeof POST_ENDPOINTS.DELETE_POST>>(
      POST_ENDPOINTS.DELETE_POST.path,
      {
        method: POST_ENDPOINTS.DELETE_POST.method,
        requiresAuth: POST_ENDPOINTS.DELETE_POST.requiresAuth,
        body: POST_ENDPOINTS.DELETE_POST.method !== 'GET' ? payload : undefined,
      },
    );
  },
};
