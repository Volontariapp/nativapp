import type { PostMediaWeb, PostWeb } from '@volontariapp/contracts';

export const createPostMediaWeb = (overrides: Partial<PostMediaWeb> = {}): PostMediaWeb => ({
  fileId: '9b2f1c52-7a63-4d0e-8f41-0c5d2e6a7b13',
  position: 0,
  ...overrides,
});

export const createPostWeb = (overrides: Partial<PostWeb> = {}): PostWeb => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  authorId: '223e4567-e89b-12d3-a456-426614174000',
  title: 'Mission Maraude Paris',
  content: 'Besoin de 5 benevoles ce samedi',
  createdAt: new Date('2026-10-16T10:00:00Z'),
  updatedAt: new Date('2026-10-16T10:00:00Z'),
  ...overrides,
});
