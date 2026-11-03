// Pages vides pour les modales de commentaires et de likers rendues par AppPost.
const emptyInfiniteResult = {
  data: { pages: [], pageParams: [] },
  isLoading: false,
  hasNextPage: false,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
};

export const mockUseInfiniteCommentsEmpty = () => emptyInfiniteResult;
export const mockUseInfinitePostLikersEmpty = () => emptyInfiniteResult;
