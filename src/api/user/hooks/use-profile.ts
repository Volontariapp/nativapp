import { useQuery } from '@tanstack/react-query';
import { userApi, type UserProfile } from '../user.api';
import { PROFILE_QUERY_KEY } from '../user-query-keys';

export { PROFILE_QUERY_KEY };

/**
 * Remplace le pattern useEffect + useState pour charger le profil utilisateur.
 * Utilise React Query pour la gestion du cache, du loading et des erreurs.
 */
export const useProfile = () => {
  return useQuery<UserProfile>({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: async () => await userApi.getMe(),
  });
};
