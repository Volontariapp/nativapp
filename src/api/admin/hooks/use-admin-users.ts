import { Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserApi } from '../admin.user.api';
import type {
  ListUsersWebResponse,
  UserWeb,
  SignUpRequest,
  UpdateUserRequest,
  ListBadgesWebResponse,
  BadgeWeb,
  UserWebResponse,
} from '@volontariapp/contracts';

const ADMIN_USERS_QUERY_KEY = ['admin', 'users'] as const;
export const ADMIN_USERS_COUNT_QUERY_KEY = ['admin', 'users', 'count'] as const;
export const ADMIN_BADGES_QUERY_KEY = ['admin', 'badges'] as const;

// ---------------------------------------------------------------------------
// Query
// ---------------------------------------------------------------------------

export const useAdminUsersQuery = () => {
  return useQuery<ListUsersWebResponse>({
    queryKey: ADMIN_USERS_QUERY_KEY,
    queryFn: async () => await adminUserApi.listUsers({ pagination: { page: 1, limit: 500 } }),
  });
};

export const useAdminUserQuery = (userId: string) => {
  return useQuery<UserWebResponse>({
    queryKey: ['admin-user', userId],
    queryFn: async () => await adminUserApi.getUser({ id: userId }),
    enabled: !!userId && userId !== 'null',
  });
};

export const useAdminBadgesQuery = () => {
  return useQuery<ListBadgesWebResponse>({
    queryKey: ADMIN_BADGES_QUERY_KEY,
    queryFn: async () => await adminUserApi.listBadges({}),
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

/** Normalise la réponse API en tableau de BadgeWeb. */
export const normalizeBadgesList = (data: ListBadgesWebResponse | undefined): BadgeWeb[] => {
  if (data == null) return [];
  if (Array.isArray(data)) return data as BadgeWeb[];
  if (Array.isArray(data.badges)) return data.badges;
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: ['admin-user', variables.userId] });
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

export const useAdminAddBadgeMutation = (userId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeId: string) => {
      await adminUserApi.addBadge({ badgeId }, { id: userId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      onSuccess?.();
      Alert.alert('Succès', 'Badge attribué avec succès !');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || "Impossible d'attribuer le badge");
    },
  });
};

export const useAdminRemoveBadgeMutation = (userId: string, onSuccess?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeId: string) => {
      await adminUserApi.removeBadge({ id: userId, badgeId });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      void queryClient.invalidateQueries({ queryKey: ADMIN_USERS_QUERY_KEY });
      onSuccess?.();
      Alert.alert('Succès', 'Badge retiré avec succès.');
    },
    onError: (error: Error) => {
      Alert.alert('Erreur', error.message || 'Impossible de retirer le badge');
    },
  });
};

