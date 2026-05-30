---
name: React Native Data Fetching & API
description: Guidelines for managing server state, queries, and API clients in React Native.
---

# 🌐 Data Fetching & API Architecture

This app uses **TanStack React Query** coupled with a custom **Axios API Client**.

## 📞 API Client (`apiFetch`)

All network requests MUST use the internal `apiFetch` wrapper located in `src/api/client.ts`.

```tsx
import { apiFetch } from '@/api/client';

// Example of a typical fetch call
const fetchUser = async (userId: string) => {
  return apiFetch<UserResponse>(`/users/${userId}`, {
    method: 'GET',
    requiresAuth: true,
  });
};
```

- Never import `axios` directly in your screens or hooks.
- `apiFetch` automatically handles Authorization Headers and Error wrapping.

## 🎣 TanStack React Query

Use React Query for all server state management.

### Query Keys

- Use array syntax for query keys: `['users', userId]`.
- Define query keys centrally if they are reused across files to prevent typos.

### Custom Hooks

Always wrap `useQuery` and `useMutation` in custom hooks.

```tsx
// ❌ BAD
const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

// ✅ GOOD
export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });
};
```

## 🛡️ Error Handling

- The `apiFetch` throws errors using the custom `createApiError` factory.
- When mutating data with `useMutation`, handle errors gracefully, typically by showing a toast or alert, but prefer doing it within the component's `onError` callback or via a global error boundary.

> [!IMPORTANT]
> Do not use `useEffect` + `useState` to fetch data. React Query is the standard.
