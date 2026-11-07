export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

export const mockSocialActions = {
  participate: jest.fn(),
  isParticipating: false,
  unparticipate: jest.fn(),
  isUnparticipating: false,
};

export interface MockParticipationsState {
  data: { pages: { ids: string[] }[] } | undefined;
}

export const mockParticipations: MockParticipationsState = { data: undefined };

export const mockAuthState: { userId: string | undefined } = { userId: undefined };
