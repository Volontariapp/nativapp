import { EventType, EventState } from '@volontariapp/contracts';

export const mapEventType = (type: EventType): string => {
  const t = typeof type === 'string' ? EventType[type as keyof typeof EventType] : type;

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

export const mapEventState = (state: EventState): string => {
  const s = typeof state === 'string' ? EventState[state as keyof typeof EventState] : state;

  switch (s) {
    case EventState.EVENT_STATE_DRAFT:
      return 'Brouillon';
    case EventState.EVENT_STATE_PUBLISHED:
      return 'Publié';
    case EventState.EVENT_STATE_CANCELLED:
      return 'Annulé';
    case EventState.EVENT_STATE_UNSPECIFIED:
      return 'Inconnu';
    default:
      return 'Pas reconnu';
  }
};
