import React from 'react';
import { Pressable } from 'react-native';
import type { AppEvent } from '@/api/event/event.api';

// EventCard dépend de la navigation et du thème statique : remplacée par un bouton inerte.
export const EventCard = ({
  event,
  onPress,
}: {
  event: AppEvent;
  onPress?: () => void;
}): React.JSX.Element => (
  <Pressable accessibilityLabel={`Carte ${event.title}`} onPress={onPress} />
);
