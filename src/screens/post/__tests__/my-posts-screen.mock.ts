// Frontieres de MyPostsScreen: requetes de posts et suppression.
export const mockFetchNextPage = jest.fn();
export const mockDeletePost = jest.fn();
export const mockMyPostsQuery = {
  data: undefined as unknown,
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: mockFetchNextPage,
};
