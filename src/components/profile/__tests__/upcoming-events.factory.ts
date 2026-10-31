import type { AppEvent } from '@/api/event/event.api';
import { createEvent } from '@/components/event/__tests__/event-app.factory';
import type { PaginatedEventListData } from '../profile-events.types';

/** Instant fixé des tests : samedi 31 octobre 2026, 18h00 (heure locale). */
export const NOW = new Date(2026, 9, 31, 18, 0);

export const createUpcomingEvent = (overrides: Partial<AppEvent> = {}): AppEvent =>
  createEvent({
    title: 'Nettoyage des berges',
    localisationName: 'Quai de Seine, Paris',
    startAt: new Date(2026, 10, 4, 9, 30).toISOString(),
    endAt: new Date(2026, 10, 4, 12, 0).toISOString(),
    ...overrides,
  });

export const createEventList = (
  overrides: Partial<PaginatedEventListData> = {},
): PaginatedEventListData => ({
  events: [],
  isLoading: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
  ...overrides,
});
