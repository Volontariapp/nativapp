import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../social.api';

const PARTICIPATIONS_QUERY_KEY = ['participations', 'me'] as const;

/**
 * Hook pour récupérer le nombre d'événements auxquels l'utilisateur participe.
 * Utilise la liste des IDs renvoyée par ms-social.
 */
export const useUserParticipations = () => {
  return useQuery({
    queryKey: PARTICIPATIONS_QUERY_KEY,
    queryFn: async () => await socialApi.getMyParticipations(),
  });
};
