import { EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import { createMockAppEvent } from '@/components/post/__tests__/event.factory';
import type { Coordinates } from '@/services/routing.service';

export const LIVE_ORIGIN: Coordinates = { latitude: 48.8566, longitude: 2.3522 };

const MINUTE_MS = 60 * 1000;

/** Evenement en direct a environ 550 m de LIVE_ORIGIN : commence il y a 30 min, finit dans 2 h. */
export const createLiveEvent = (overrides?: Partial<AppEvent>, now = Date.now()): AppEvent =>
  createMockAppEvent({
    startAt: new Date(now - 30 * MINUTE_MS).toISOString(),
    endAt: new Date(now + 120 * MINUTE_MS).toISOString(),
    state: EventState.EVENT_STATE_IN_PROGRESS,
    location: { latitude: LIVE_ORIGIN.latitude + 0.005, longitude: LIVE_ORIGIN.longitude },
    organizerId: 'organizer-1',
    ...overrides,
  });
