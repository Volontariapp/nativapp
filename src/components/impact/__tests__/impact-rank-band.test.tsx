import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { lightTheme } from '@/shared/themes/theme';
import { getImpactRankStatus } from '@/shared/lib/impact-ranks';
import { ImpactRankBand } from '../impact-rank-band';

type ElementLookup = (testId: string) => { props: { style?: StyleProp<ViewStyle> } };

const styleOf = (getByTestId: ElementLookup, testId: string): ViewStyle =>
  StyleSheet.flatten(getByTestId(testId).props.style);

describe('ImpactRankBand', () => {
  it('shows the current rank and the cumulated points', () => {
    const { getByText } = render(<ImpactRankBand status={getImpactRankStatus(1250)} />);

    expect(getByText('IMPACT WARRIOR')).toBeTruthy();
    expect(getByText('1 250 pts')).toBeTruthy();
  });

  it('explains how many points remain to reach the next rank', () => {
    const { getByText } = render(<ImpactRankBand status={getImpactRankStatus(1250)} />);

    expect(getByText('Plus que 250 pts pour devenir CHANGE MAKER')).toBeTruthy();
  });

  it('fills the progress bar according to the progress inside the current rank', () => {
    const { getByTestId } = render(<ImpactRankBand status={getImpactRankStatus(1250)} />);

    expect(styleOf(getByTestId, 'impact-rank-progress-fill').width).toBe('69%');
  });

  it('celebrates the highest rank with a full bar and no next rank to chase', () => {
    const { getByText, getByTestId, queryByText } = render(
      <ImpactRankBand status={getImpactRankStatus(30000)} />,
    );

    expect(getByText('ATLAS TITAN')).toBeTruthy();
    expect(getByText('Rang maximum atteint, tu es au sommet')).toBeTruthy();
    expect(queryByText(/Plus que/)).toBeNull();
    expect(styleOf(getByTestId, 'impact-rank-progress-fill').width).toBe('100%');
  });

  it('spans the full width: no side margin and no rounded corners', () => {
    const { getByTestId } = render(<ImpactRankBand status={getImpactRankStatus(1250)} />);

    const style = styleOf(getByTestId, 'impact-rank-band');

    expect(style.marginHorizontal ?? 0).toBe(0);
    expect(style.borderRadius ?? 0).toBe(0);
  });

  it('opens the ranks page when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <ImpactRankBand status={getImpactRankStatus(1250)} onPress={onPress} />,
    );

    fireEvent.press(getByLabelText('Voir tous les rangs'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the green of the theme as background', () => {
    const { getByTestId } = render(<ImpactRankBand status={getImpactRankStatus(1250)} />);

    expect(styleOf(getByTestId, 'impact-rank-band').backgroundColor).toBe(
      lightTheme.colors.primaryEco,
    );
  });
});
