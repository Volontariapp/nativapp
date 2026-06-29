import { useQuery } from '@tanstack/react-query';
import { userApi, type UserPublicProfile } from '../user.api';

const PROFILE_QUERY_KEY = ['profile'] as const;

/**
 * Remplace le pattern useEffect + useState pour charger le profil utilisateur.
 * Utilise React Query pour la gestion du cache, du loading et des erreurs.
 */
export const useGetPublicUser = (userId: string) => {
  return useQuery<UserPublicProfile>({
    queryKey: [...PROFILE_QUERY_KEY, userId],
    queryFn: async () => await userApi.getPublicUser(userId),
  });
};
