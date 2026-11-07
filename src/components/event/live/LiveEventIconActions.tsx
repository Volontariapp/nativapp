import React from 'react';
import { LiveIconAction } from './LiveIconAction';

export const ROUTE_ACTION_LABEL = 'Comment y aller';
export const DETAIL_ACTION_LABEL = "Voir le détail de l'événement";

export interface LiveEventIconActionsProps {
  eventId: string;
  onShowRoute?: () => void;
  onOpenDetail: () => void;
}

/** Icones d'itineraire ("Comment y aller") et de detail, communes a toutes les cartes. */
export function LiveEventIconActions({
  eventId,
  onShowRoute,
  onOpenDetail,
}: LiveEventIconActionsProps): React.JSX.Element {
  return (
    <>
      {onShowRoute !== undefined && (
        <LiveIconAction
          icon="directions"
          iconLibrary="MaterialDesignIcons"
          accessibilityLabel={ROUTE_ACTION_LABEL}
          onPress={onShowRoute}
          testID={`live-route-${eventId}`}
        />
      )}
      <LiveIconAction
        icon="info"
        accessibilityLabel={DETAIL_ACTION_LABEL}
        onPress={onOpenDetail}
        testID={`live-detail-${eventId}`}
      />
    </>
  );
}
