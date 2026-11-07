import type { LiveOrganizerPosition } from '@/hooks/live-organizer.types';

export const ORGANIZER_NOW = Date.parse('2026-11-07T12:00:00.000Z');

export const createOrganizerPosition = (
  overrides?: Partial<LiveOrganizerPosition>,
): LiveOrganizerPosition => ({
  userId: 'user-raw-id-1',
  latitude: 48.857,
  longitude: 2.352,
  updatedAt: ORGANIZER_NOW - 20_000,
  ...overrides,
});
