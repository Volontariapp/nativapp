import { EventType } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';

export type EventTone = 'social' | 'eco';

export const getEventTone = (event: AppEvent): EventTone =>
  event.type === EventType.EVENT_TYPE_SOCIAL ||
  String(event.type) === EventType[EventType.EVENT_TYPE_SOCIAL]
    ? 'social'
    : 'eco';
