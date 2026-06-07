import { z } from 'zod';

export const postSchema = z.object({
  title: z.string().min(3, 'Le titre est trop court').max(100, 'Le titre est trop long'),
  content: z.string().min(1, 'Le contenu ne peut pas être vide').max(2000, 'Le contenu est trop long'),
});

export type PostFormValues = z.infer<typeof postSchema>;
