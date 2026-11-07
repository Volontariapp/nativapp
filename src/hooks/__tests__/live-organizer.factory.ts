import type {
  ILiveParticipantPosition,
  ILivePositionsUpdatedWebsocketPayload,
  ILiveSharingStoppedWebsocketPayload,
} from '@volontariapp/messaging';

export const ORGANIZER_EVENT_ID = 'evt-organizer-1';

export const createParticipantPosition = (
  overrides?: Partial<ILiveParticipantPosition>,
): ILiveParticipantPosition => ({
  userId: 'user-1',
  latitude: 48.857,
  longitude: 2.352,
  updatedAt: new Date().toISOString(),
  ...overrides,
});

export const createPositionsPayload = (
  positions: ILiveParticipantPosition[] = [createParticipantPosition()],
  eventId: string = ORGANIZER_EVENT_ID,
): ILivePositionsUpdatedWebsocketPayload => ({ eventId, positions });

export const createStoppedPayload = (
  overrides?: Partial<ILiveSharingStoppedWebsocketPayload>,
): ILiveSharingStoppedWebsocketPayload => ({
  eventId: ORGANIZER_EVENT_ID,
  userId: 'user-1',
  reason: 'STOPPED',
  ...overrides,
});
