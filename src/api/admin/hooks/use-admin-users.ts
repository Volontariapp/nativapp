import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserApi } from '../admin.user.api';
import type {
  ListUsersWebResponse,
  UserWeb,
  SignUpRequest,
  UpdateUserRequest,
} from '@volontariapp/contracts';

const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;
export const ADMIN_USERS_COUNT_QUERY_KEY = ['admin', 'users', 'count'] as const;

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export const useAdminUsersQuery = () => {
  return useQuery<ListUsersWebResponse>({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: async () => await adminUserApi.listUsers({ pagination: { page: 1, limit: 200 } }),
  });
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise la réponse API en tableau d'UserWeb, quel que soit le shape retourné. */
export const normalizeUsersList = (data: ListUsersWebResponse | undefined): UserWeb[] => {
  if (data == null) return [];
  if (Array.isArray(data)) return data as UserWeb[];
  if (Array.isArray(data.users)) return data.users;
  return [];
};

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export const useCreateUserMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: SignUpRequest) => await adminUserApi.signUp(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_COUNT_QUERY_KEY });
      onSuccess?.();
      Alert.alert('Succès', 'Utilisateur créé avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de créer l'utilisateur");
    },
  });
};

export const useUpdateUserMutation = (onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, payload }: { userId: string; payload: UpdateUserRequest }) =>
      await adminUserApi.updateUser(payload, { id: userId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      onSuccess?.();
      Alert.alert('Succès', 'Utilisateur modifié avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de modifier l'utilisateur");
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await adminUserApi.deleteUser({ id: userId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_COUNT_QUERY_KEY });
      Alert.alert('Succès', 'Utilisateur supprimé.');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible de supprimer l'utilisateur");
    },
  });
};
