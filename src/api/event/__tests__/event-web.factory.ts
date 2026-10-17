import type { EventDTO } from '@volontariapp/contracts';

/** Évènement tel que la gateway l'expose, avec les champs de photo au repos. */
export const createEventDto = (overrides: Partial<EventDTO> = {}): EventDTO =>
  ({
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Maraude du samedi',
    description: 'Distribution de repas',
    localisationName: 'Paris',
    awardedImpactScore: 10,
    maxParticipants: 50,
    currentParticipants: 0,
    tags: [],
    requirements: [],
    ...overrides,
  }) as EventDTO;
