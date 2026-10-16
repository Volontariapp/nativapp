import type { PostMediaStatusWeb, PostWebResponse } from '@volontariapp/contracts';

export const createPostResponse = (mediaStatus: PostMediaStatusWeb = 'NONE'): PostWebResponse => ({
  post: {
    id: '123e4567-e89b-12d3-a456-426614174000',
    authorId: '223e4567-e89b-12d3-a456-426614174000',
    title: 'Mission Maraude Paris',
    content: 'Besoin de 5 benevoles ce samedi',
    createdAt: new Date('2026-10-16T10:00:00Z'),
    updatedAt: new Date('2026-10-16T10:00:00Z'),
    media: [],
    mediaStatus,
  },
});
