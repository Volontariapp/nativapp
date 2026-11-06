export interface FetchOptions<TRequest> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: TRequest;
  requiresAuth?: boolean;
  params?: Record<string, unknown>;
  /**
   * Un 206 allume l'indicateur global "Synchronisation en cours", eteint par un evenement
   * WebSocket de fallback. A passer a false pour les lectures dont le 206 est gere par la requete
   * elle-meme (ranking : repli sur une liste chronologique puis polling), sinon l'indicateur
   * reste allume tant qu'aucun evenement ne le coupe.
   */
  signalSyncPending?: boolean;
}
