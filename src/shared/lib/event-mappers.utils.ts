import { EventState, EventType } from '@volontariapp/contracts';

export const normalizeEventState = (
  state: EventState | number | string | undefined | null,
): EventState => {
  if (state === undefined || state === null) return EventState.EVENT_STATE_UNSPECIFIED;
  if (typeof state === 'number') return state;
  const parsed = Number(state);
  if (!Number.isNaN(parsed)) return parsed;
  if (typeof state === 'string' && state in EventState) {
    const val = EventState[state as keyof typeof EventState];
    if (typeof val === 'number') return val;
  }
  return EventState.EVENT_STATE_UNSPECIFIED;
};

export const normalizeEventType = (
  type: EventType | number | string | undefined | null,
): EventType => {
  if (type === undefined || type === null) return EventType.EVENT_TYPE_UNSPECIFIED;
  if (typeof type === 'number') return type;
  const parsed = Number(type);
  if (!Number.isNaN(parsed)) return parsed;
  if (typeof type === 'string' && type in EventType) {
    const val = EventType[type as keyof typeof EventType];
    if (typeof val === 'number') return val;
  }
  return EventType.EVENT_TYPE_UNSPECIFIED;
};

export const mapEventType = (type: EventType | number | string): string => {
  const t = normalizeEventType(type);

  switch (t) {
    case EventType.EVENT_TYPE_ECOLOGY:
      return 'Écologie';
    case EventType.EVENT_TYPE_SOCIAL:
      return 'Social';
    case EventType.EVENT_TYPE_UNSPECIFIED:
      return 'Inconnu';
    default:
      return 'Pas reconnu';
  }
};
