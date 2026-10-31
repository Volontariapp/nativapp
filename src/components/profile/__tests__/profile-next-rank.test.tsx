import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { formatPoints, getImpactRankStatus } from '@/shared/lib/impact-ranks';
import { ProfileNextRank } from '../profile-next-rank';

type StyledElement = { props: { style?: StyleProp<ViewStyle> } };

const flexOf = (element: StyledElement): ViewStyle['flex'] =>
  StyleSheet.flatten(element.props.style).flex;

const mockOnPress = jest.fn();

describe('ProfileNextRank', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('names the next rank and the points still missing', () => {
    const status = getImpactRankStatus(120);
    const { getByText } = render(<ProfileNextRank status={status} />);

    expect(getByText(status.next?.name ?? '')).toBeTruthy();
    expect(getByText(`Plus que ${formatPoints(status.pointsToNext)} pts`)).toBeTruthy();
  });

  it('fills the progress bar with the progress made in the current rank', () => {
    const status = getImpactRankStatus(200);
    const { getByTestId } = render(<ProfileNextRank status={status} />);

    expect(flexOf(getByTestId('profile-next-rank-fill'))).toBe(status.ratio);
  });

  it('congratulates the user at the maximum rank instead of showing a next one', () => {
    const { getByText, queryByTestId } = render(
      <ProfileNextRank status={getImpactRankStatus(99999)} />,
    );

    expect(getByText('Rang maximum atteint')).toBeTruthy();
    expect(queryByTestId('profile-next-rank-fill')).toBeNull();
  });

  it('opens the ranks page when pressed', () => {
    const { getByLabelText } = render(
      <ProfileNextRank status={getImpactRankStatus(120)} onPress={mockOnPress} />,
    );

    fireEvent.press(getByLabelText('Voir tous les rangs'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
