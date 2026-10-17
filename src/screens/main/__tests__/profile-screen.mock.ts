export const mockUseProfile = jest.fn();
export const mockUseProfileEvents = jest.fn();
export const mockUseGetFollows = jest.fn();
export const mockUseGetFollowers = jest.fn();

const emptyList = {
  events: [],
  isLoading: false,
  hasNextPage: false,
  fetchNextPage: jest.fn(),
  isFetchingNextPage: false,
  totalCount: 0,
};

export const createProfileEvents = (): Record<string, unknown> => ({
  participated: emptyList,
  finished: emptyList,
  created: { ...emptyList, totalCount: 2 },
  wished: emptyList,
  markedDates: {},
});
