export const mockUseProfile = jest.fn();
export const mockUseProfileEvents = jest.fn();
export const mockUseGetFollows = jest.fn();
export const mockUseGetFollowers = jest.fn();
export const mockUseGetMyPosts = jest.fn();
export const mockNavigate = jest.fn();

const emptyList = {
  events: [],
  isLoading: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
  totalCount: 0,
};

export const createProfileEvents = (): Record<string, unknown> => ({
  upcoming: emptyList,
  finished: { ...emptyList },
});

export const createMyPosts = (): Record<string, unknown> => ({
  data: { pages: [{ posts: [] }] },
  isLoading: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
});
