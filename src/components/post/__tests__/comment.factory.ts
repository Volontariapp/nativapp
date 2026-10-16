import type { CommentWebResponse } from '@volontariapp/contracts';

export const createComment = (overrides: Partial<CommentWebResponse> = {}): CommentWebResponse => ({
  id: 'comment-1',
  postId: 'post-1',
  authorId: 'author-1',
  content: 'Super initiative !',
  createdAt: '2026-10-16T10:00:00.000Z',
  updatedAt: '2026-10-16T10:00:00.000Z',
  ...overrides,
});
