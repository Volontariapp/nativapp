import { EventType } from '@volontariapp/contracts';

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
