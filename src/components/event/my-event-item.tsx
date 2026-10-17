import React from 'react';
import type { AppEvent } from '@/api/event/event.api';
import { EventCard } from '@/components/dataDisplay/EventCard';

interface MyEventItemProps {
  event: AppEvent;
  onPress: () => void;
  /** Ouvre l'écran de modification de l'évènement. */
  onEdit: () => void;
}

/** Évènement de l'organisateur : sa carte, avec le bouton de modification sur le côté. Le statut est le titre de sa section. */
export function MyEventItem({ event, onPress, onEdit }: MyEventItemProps): React.JSX.Element {
  return <EventCard event={event} onPress={onPress} onEdit={onEdit} />;
}
