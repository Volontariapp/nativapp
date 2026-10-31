import type { AppEvent } from '@/api/event/event.api';

/** Liste paginée d'évènements telle que l'expose useProfileEvents (une page React Query). */
export interface PaginatedEventListData {
  events: AppEvent[];
  isLoading: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
}
