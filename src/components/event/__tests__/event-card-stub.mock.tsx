import React from 'react';
import { Pressable, View } from 'react-native';
import type { AppEvent } from '@/api/event/event.api';

// EventCard dépend de la navigation et du thème statique : remplacée par deux boutons inertes.
export const EventCard = ({
  event,
  onPress,
  onEdit,
}: {
  event: AppEvent;
  onPress?: () => void;
  onEdit?: () => void;
}): React.JSX.Element => (
  <View>
    <Pressable accessibilityLabel={`Carte ${event.title}`} onPress={onPress} />
    {onEdit !== undefined && (
      <Pressable accessibilityLabel={`Modifier l'évènement ${event.title}`} onPress={onEdit} />
    )}
  </View>
);
