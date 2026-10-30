import { z } from 'zod';
import { EventType } from '@volontariapp/contracts';

const requirementSchema = z.object({
  name: z.string().min(2, 'Le nom est trop court'),
  description: z.string().min(5, 'La description est trop courte'),
  neededQuantity: z.number().min(1, 'Au moins 1 requis'),
});

export const eventSchema = z
  .object({
    title: z.string().min(3, 'Le titre est trop court'),
    description: z.string().min(10, 'La description est trop courte'),
    localisationName: z.string().min(2, 'Lieu invalide'),
    type: z.custom<EventType>(
      (val) => val === EventType.EVENT_TYPE_ECOLOGY || val === EventType.EVENT_TYPE_SOCIAL,
      {
        message: "Le type d'évènement est obligatoire (Écologie ou Social)",
      },
    ),
    maxParticipants: z.number().min(1, 'Au moins 1 participant'),
    startAt: z.date({ message: 'Date requise' }),
    endAt: z.date({ message: 'Date requise' }),
    requirements: z.array(requirementSchema),
  })
  .refine(
    (data) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return data.startAt >= today;
    },
    {
      message: "La date de l'évènement ne peut pas être antérieure à aujourd'hui",
      path: ['startAt'],
    },
  )
  .refine((data) => data.endAt > data.startAt, {
    message: 'La date de fin doit être après le début',
    path: ['endAt'],
  });

export type EventFormValues = z.infer<typeof eventSchema>;

export const updateEventSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  localisationName: z.string().min(2, 'Le lieu doit contenir au moins 2 caractères').optional(),
  maxParticipants: z.number().min(1, 'Au moins 1 participant requis').optional(),
});

export type UpdateEventFormValues = z.infer<typeof updateEventSchema>;
