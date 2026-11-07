/** Derniere position connue d'un participant qui partage (coordonnees deja arrondies par le serveur). */
export interface LiveOrganizerPosition {
  userId: string;
  latitude: number;
  longitude: number;
  /** Horodatage serveur de la position, en millisecondes. */
  updatedAt: number;
}

export interface UseLiveOrganizerPositionsResult {
  positions: LiveOrganizerPosition[];
  /** Horloge rafraichie par la minuterie de purge : sert a afficher l'age des positions. */
  now: number;
}
