interface PagingState {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  loadedPages: number;
  /** Plafond de pages chargees, pour borner le cout reseau. */
  maxPages: number;
}

/** Une liste qui doit etre complete (carte, participants) charge seule ses pages, jusqu'au plafond. */
export const shouldLoadNextPage = ({
  hasNextPage,
  isFetchingNextPage,
  loadedPages,
  maxPages,
}: PagingState): boolean => hasNextPage && !isFetchingNextPage && loadedPages < maxPages;
