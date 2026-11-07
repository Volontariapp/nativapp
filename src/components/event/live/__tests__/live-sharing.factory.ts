import type { LiveSharingState } from '@/hooks/live-sharing.types';

export const createSharingState = (overrides?: Partial<LiveSharingState>): LiveSharingState => ({
  status: 'idle',
  activeEventId: null,
  lastStop: null,
  ...overrides,
});
