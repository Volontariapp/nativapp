---
name: React Native Stability & Reliability
description: Technical rules for a stable, crash-free, and performant React Native app.
---

# 🛡️ React Native Stability & Reliability

To ensure the application remains stable in production, you must strictly follow these technical rules.

## 1. Error Boundaries & Crash Prevention

- **Never** let an unhandled JS exception crash the app (White Screen of Death).
- Wrap major navigators and complex screens in `ErrorBoundary` components.
- Always use `try/catch` for `async/await` operations, particularly when interacting with native modules (like FileSystem, SecureStore, Camera).

## 2. Memory Leak Prevention

- **Clean up listeners**: Whenever you subscribe to an event (Socket.io, AppState, Keyboard, Dimensions, EventBus), you MUST return a cleanup function in your `useEffect`.

```tsx
useEffect(() => {
  const subscription = AppState.addEventListener('change', handleAppStateChange);
  return () => {
    subscription.remove(); // MANDATORY CLEANUP
  };
}, []);
```

- Avoid closures that trap large objects in memory.

## 3. Secure Data Storage

- **Never** store sensitive data (tokens, passwords, PII) in `AsyncStorage`.
- Always use `expo-secure-store` for authentication tokens and sensitive user preferences.

## 4. Network & Offline Resilience

- Do not assume the network is always available.
- Always provide a timeout for API requests (handled globally via Axios/apiFetch configuration).
- Use React Query's `staleTime` and `cacheTime` intelligently to reduce unnecessary background fetches.
- Display fallback UI (Skeletons or offline indicators) when data cannot be fetched.

## 5. Render Performance

- Avoid defining functions inside the `render` method of FlatLists.
- Always extract `renderItem` and `keyExtractor` outside the component or wrap them in `useCallback`.
- Use `memo` for complex list items to prevent re-rendering the entire list when a single item changes.
- Beware of `StyleSheet.flatten` or passing inline objects `{}` to deeply nested components as it breaks referential equality.

## 6. Deep Linking & Navigation Safety

- Always handle undefined routes gracefully.
- Validate parameters received from deep links before using them (e.g., using Zod) as they can be malformed or malicious.
