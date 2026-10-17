import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';

export const createEvent = (overrides: Partial<AppEvent> = {}): AppEvent => ({
  id: 'event-1',
  title: 'Maraude du samedi',
  description: 'Distribution de repas',
  startAt: '2999-10-15T10:00:00.000Z',
  endAt: '2999-10-15T12:00:00.000Z',
  localisationName: 'Paris',
  type: 1,
  state: EventState.EVENT_STATE_PUBLISHED,
  awardedImpactScore: 10,
  maxParticipants: 50,
  currentParticipants: 0,
  ...overrides,
});
