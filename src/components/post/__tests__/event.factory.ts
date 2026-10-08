import type { AppEvent } from '@/api/event/event.api';
import { EventType, EventState } from '@volontariapp/contracts';

export const createMockAppEvent = (overrides?: Partial<AppEvent>): AppEvent => ({
  id: 'event-1',
  title: 'Nettoyage du parc de Belleville',
  description: 'Rejoignez-nous pour ramasser les déchets et embellir le parc.',
  startAt: '2026-10-15T09:00:00.000Z',
  endAt: '2026-10-15T12:00:00.000Z',
  localisationName: 'Parc de Belleville, Paris',
  type: EventType.EVENT_TYPE_ECOLOGY,
  state: EventState.EVENT_STATE_PUBLISHED,
  awardedImpactScore: 50,
  maxParticipants: 20,
  currentParticipants: 8,
  ...overrides,
});
