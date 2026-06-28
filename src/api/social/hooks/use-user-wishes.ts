import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

export const WISHES_QUERY_KEY = ['wishes', 'me'] as const;

/**
 * Hook pour récupérer la liste des IDs d'événements dans les souhaits de l'utilisateur.
 * Utilise la liste des IDs renvoyée par ms-social.
 */
export const useUserWishes = () => {
  return useQuery({
    queryKey: WISHES_QUERY_KEY,
    queryFn: async () => await socialApi.getMyWishes(),
  });
};
