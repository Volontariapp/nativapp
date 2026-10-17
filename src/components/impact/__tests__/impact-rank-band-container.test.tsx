import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { createProfile } from '@/components/profile/__tests__/profile.factory';
import { ImpactRankBandContainer } from '../impact-rank-band-container';
import { mockNavigate, mockUseProfile } from './impact-rank-band-container.mock';

jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: (): unknown => mockUseProfile(),
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: (): unknown => ({ navigate: mockNavigate }),
}));

describe('ImpactRankBandContainer', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the rank that matches the score of the profile', () => {
    mockUseProfile.mockReturnValue({
      data: createProfile({ totalImpactScore: 1250 }),
      isLoading: false,
    });

    const { getByText } = render(<ImpactRankBandContainer />);

    expect(getByText('IMPACT WARRIOR')).toBeTruthy();
    expect(getByText('1 250 pts')).toBeTruthy();
  });

  it('opens the ranks page when the band is pressed', () => {
    mockUseProfile.mockReturnValue({ data: createProfile(), isLoading: false });
    const { getByLabelText } = render(<ImpactRankBandContainer />);

    fireEvent.press(getByLabelText('Voir tous les rangs'));

    expect(mockNavigate).toHaveBeenCalledWith('Ranks');
  });

  it('renders nothing while the profile is loading', () => {
    mockUseProfile.mockReturnValue({ data: undefined, isLoading: true });

    const { queryByTestId } = render(<ImpactRankBandContainer />);

    expect(queryByTestId('impact-rank-band')).toBeNull();
  });

  it('renders nothing when the profile failed to load', () => {
    mockUseProfile.mockReturnValue({ data: undefined, isLoading: false, error: new Error('boom') });

    const { queryByTestId } = render(<ImpactRankBandContainer />);

    expect(queryByTestId('impact-rank-band')).toBeNull();
  });
});
