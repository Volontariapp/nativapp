import { apiFetch } from '../client';
import { POST_ENDPOINTS } from '../endpoints/post.endpoints';
import type {
  ListPostsRequest,
  ListPostsWebResponse,
  PostWebResponse,
  CreatePostRequest,
  UpdatePostRequest,
  ActionSuccessWebResponse,
} from '@volontariapp/contracts';

export const adminPostApi = {
  async listPosts(
    payload: ListPostsRequest,
    pathParams?: Record<string, string>,
  ): Promise<ListPostsWebResponse> {
    let finalPath: string = POST_ENDPOINTS.LIST_POSTS.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ListPostsWebResponse, ListPostsRequest>(finalPath, {
      method: POST_ENDPOINTS.LIST_POSTS.method,
      requiresAuth: POST_ENDPOINTS.LIST_POSTS.requiresAuth,
      body: POST_ENDPOINTS.LIST_POSTS.method !== 'GET' ? payload : undefined,
    });
  },

  async getPost(pathParams?: Record<string, string>): Promise<PostWebResponse> {
    let finalPath: string = POST_ENDPOINTS.GET_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<PostWebResponse>(finalPath, {
      method: POST_ENDPOINTS.GET_POST.method,
      requiresAuth: POST_ENDPOINTS.GET_POST.requiresAuth,
    });
  },

  async createPost(
    payload: CreatePostRequest,
    pathParams?: Record<string, string>,
  ): Promise<PostWebResponse> {
    let finalPath: string = POST_ENDPOINTS.CREATE_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<PostWebResponse, CreatePostRequest>(finalPath, {
      method: POST_ENDPOINTS.CREATE_POST.method,
      requiresAuth: POST_ENDPOINTS.CREATE_POST.requiresAuth,
      body: POST_ENDPOINTS.CREATE_POST.method !== 'GET' ? payload : undefined,
    });
  },

  async updatePost(
    payload: UpdatePostRequest,
    pathParams?: Record<string, string>,
  ): Promise<PostWebResponse> {
    let finalPath: string = POST_ENDPOINTS.UPDATE_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<PostWebResponse, UpdatePostRequest>(finalPath, {
      method: POST_ENDPOINTS.UPDATE_POST.method,
      requiresAuth: POST_ENDPOINTS.UPDATE_POST.requiresAuth,
      body: POST_ENDPOINTS.UPDATE_POST.method !== 'GET' ? payload : undefined,
    });
  },

  async deletePost(pathParams?: Record<string, string>): Promise<ActionSuccessWebResponse> {
    let finalPath: string = POST_ENDPOINTS.DELETE_POST.path;
    if (pathParams != null) {
      Object.entries(pathParams).forEach(([k, v]) => {
        finalPath = finalPath.replace(':' + k, v);
      });
    }
    return apiFetch<ActionSuccessWebResponse>(finalPath, {
      method: POST_ENDPOINTS.DELETE_POST.method,
      requiresAuth: POST_ENDPOINTS.DELETE_POST.requiresAuth,
    });
  },
};
