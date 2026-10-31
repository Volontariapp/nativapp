export const mockNavigate = jest.fn();

export const mockNavigation = {
  useNavigation: (): { navigate: typeof mockNavigate } => ({ navigate: mockNavigate }),
};
