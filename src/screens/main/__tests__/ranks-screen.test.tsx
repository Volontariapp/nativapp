import React from 'react';
import { render } from '@testing-library/react-native';
import { createProfile } from '@/components/profile/__tests__/profile.factory';
import { RanksScreen } from '../RanksScreen';
import { mockUseProfile } from './ranks-screen.mock';

jest.mock('@/api/user/hooks/use-profile', () => ({
  useProfile: (): unknown => mockUseProfile(),
}));
jest.mock('@/components/layout/AppHeader', () => ({
  __esModule: true,
  default: (): null => null,
}));

describe('RanksScreen', () => {
  beforeEach(() => {
    mockUseProfile.mockReturnValue({
      data: createProfile({ totalImpactScore: 1250 }),
      isLoading: false,
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('lists the ten ranks with their threshold and their tagline', () => {
    const { getByText } = render(<RanksScreen />);

    [
      ['ROOKIE HELPER', '0 pts'],
      ['FIELD VOLUNTEER', '100 pts'],
      ['COMMUNITY RANGER', '300 pts'],
      ['IMPACT WARRIOR', '700 pts'],
      ['CHANGE MAKER', '1 500 pts'],
      ['IMPACT MASTER', '3 000 pts'],
      ['HOPE GUARDIAN', '5 500 pts'],
      ['WORLD DEFENDER', '9 000 pts'],
      ['LIVING LEGEND', '15 000 pts'],
      ['ATLAS TITAN', '25 000 pts'],
    ].forEach(([name, threshold]) => {
      expect(getByText(name as string)).toBeTruthy();
      expect(getByText(threshold as string)).toBeTruthy();
    });
    expect(getByText('Aucune mission ne te résiste.')).toBeTruthy();
  });

  it('tells which ranks are unlocked, which one is the current rank and which are locked', () => {
    const { getByLabelText, getAllByText } = render(<RanksScreen />);

    expect(getByLabelText('FIELD VOLUNTEER, débloqué')).toBeTruthy();
    expect(getByLabelText('IMPACT WARRIOR, rang actuel')).toBeTruthy();
    expect(getByLabelText('CHANGE MAKER, verrouillé')).toBeTruthy();
    expect(getAllByText('Débloqué')).toHaveLength(3);
    expect(getAllByText('Rang actuel')).toHaveLength(1);
    expect(getAllByText('Verrouillé')).toHaveLength(6);
  });

  it('shows the points of the user', () => {
    const { getByText } = render(<RanksScreen />);

    expect(getByText('Tes points : 1 250 pts')).toBeTruthy();
  });

  it('starts from the first rank while the profile is not available', () => {
    mockUseProfile.mockReturnValue({ data: undefined, isLoading: true });

    const { getByLabelText } = render(<RanksScreen />);

    expect(getByLabelText('ROOKIE HELPER, rang actuel')).toBeTruthy();
  });
});
