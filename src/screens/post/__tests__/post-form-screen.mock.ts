export const mockMutateAsync = jest.fn();
export const mockGoBack = jest.fn();
export const mockUseCreatePost = jest.fn(() => ({
  mutateAsync: mockMutateAsync,
  isPending: false,
}));
export const mockUseNavigation = jest.fn(() => ({
  goBack: mockGoBack,
  navigate: jest.fn(),
}));
