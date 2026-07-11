---
name: React Native Event Fetching
description: Guidelines and best practices for fetching events efficiently in the front-end.
---

# 📅 Event Fetching Architecture

This app standardizes event retrieval through the `useGetEvents` custom hook, which acts as a wrapper around React Query and our `eventApi`.

## 🎣 The `useGetEvents` Hook

For fetching a list of events (such as for the Swipe screen or exploration pages), always use `useGetEvents`. This hook natively handles pagination and supports advanced filters like geographic radius or social exclusions.

### 📋 Supported Filters

The hook accepts a `Partial<SearchEventsRequest>` object, which maps directly to the API Gateway filters:

- `limit` / `page` : Pagination controls
- `searchTerm` : Full-text search
- `excludeCreatedByMe` : Hide user-created events
- `excludeParticipatedByMe` : Hide events the user is already attending
- `onlyAvailable` : Show only open events with available spots
- `types` / `tagSlugs` : Filter by category

### ✅ Best Practices

```tsx
// ❌ BAD
const { data } = useQuery(['events'], () => eventApi.getEvents({ limit: 10 }));

// ✅ GOOD
import { useGetEvents } from '@/api/event/hooks/use-get-events';

const { data, fetchNextPage } = useGetEvents({
  limit: 10,
  excludeCreatedByMe: true,
  onlyAvailable: true,
});
```

- Always use the dedicated custom hook `useGetEvents` rather than calling `eventApi` manually.
- The `useGetEvents` hook uses `useInfiniteQuery` under the hood, making it ideal for infinite scroll lists (`FlatList`) or swiping decks. Just call `fetchNextPage()` when the user reaches the end.
- Pass query parameters directly into the hook's arguments. The `apiFetch` client will automatically serialize them for Axios.
