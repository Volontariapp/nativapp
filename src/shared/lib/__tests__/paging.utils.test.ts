import { shouldLoadNextPage } from '../paging.utils';

describe('shouldLoadNextPage', () => {
  it('loads the next page while there is one and nothing is loading', () => {
    expect(
      shouldLoadNextPage({
        hasNextPage: true,
        isFetchingNextPage: false,
        loadedPages: 1,
        maxPages: 3,
      }),
    ).toBe(true);
  });

  it('waits for the page being fetched', () => {
    expect(
      shouldLoadNextPage({
        hasNextPage: true,
        isFetchingNextPage: true,
        loadedPages: 1,
        maxPages: 3,
      }),
    ).toBe(false);
  });

  it('stops when there is no next page', () => {
    expect(
      shouldLoadNextPage({
        hasNextPage: false,
        isFetchingNextPage: false,
        loadedPages: 2,
        maxPages: 3,
      }),
    ).toBe(false);
  });

  it('stops once the maximum number of pages is loaded', () => {
    expect(
      shouldLoadNextPage({
        hasNextPage: true,
        isFetchingNextPage: false,
        loadedPages: 2,
        maxPages: 3,
      }),
    ).toBe(true);
    expect(
      shouldLoadNextPage({
        hasNextPage: true,
        isFetchingNextPage: false,
        loadedPages: 3,
        maxPages: 3,
      }),
    ).toBe(false);
  });
});
