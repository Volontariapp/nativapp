import React from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';
import { lightTheme } from '@/shared/themes/theme';
import {
  IMPACT_RANKS,
  formatPoints,
  getImpactRankStatus,
  type ImpactRank,
} from '@/shared/lib/impact-ranks';
import { ImpactRankBand } from '../impact-rank-band';

type ElementLookup = (testId: string) => { props: { style?: StyleProp<ViewStyle> } };

const styleOf = (getByTestId: ElementLookup, testId: string): ViewStyle =>
  StyleSheet.flatten(getByTestId(testId).props.style);

const rankAt = (index: number): ImpactRank => {
  const rank = IMPACT_RANKS[index];
  if (rank === undefined) throw new Error(`No impact rank at index ${String(index)}`);
  return rank;
};

const CURRENT = rankAt(3);
const NEXT = rankAt(4);
const LAST_RANK = rankAt(IMPACT_RANKS.length - 1);
const POINTS_INTO_RANK = 250;
const POINTS = CURRENT.minPoints + POINTS_INTO_RANK;
const POINTS_TO_NEXT = NEXT.minPoints - POINTS;
const PROGRESS_PERCENT = Math.round(
  (POINTS_INTO_RANK / (NEXT.minPoints - CURRENT.minPoints)) * 100,
);

describe('ImpactRankBand', () => {
  it('shows the current rank and the cumulated points', () => {
    const { getByText } = render(<ImpactRankBand status={getImpactRankStatus(POINTS)} />);

    expect(getByText(CURRENT.name)).toBeTruthy();
    expect(getByText(`${formatPoints(POINTS)} pts`)).toBeTruthy();
  });

  it('keeps the literal threshold table anchored', () => {
    expect(getImpactRankStatus(299).current.name).toBe('ROOKIE HELPER');
    expect(getImpactRankStatus(300).current.name).toBe('FIELD VOLUNTEER');
    expect(getImpactRankStatus(2100).current.name).toBe('IMPACT WARRIOR');
    expect(getImpactRankStatus(75000).current.name).toBe('ATLAS TITAN');
  });

  it('explains how many points remain to reach the next rank', () => {
    const { getByText } = render(<ImpactRankBand status={getImpactRankStatus(POINTS)} />);

    expect(
      getByText(`Plus que ${formatPoints(POINTS_TO_NEXT)} pts pour devenir ${NEXT.name}`),
    ).toBeTruthy();
  });

  it('fills the progress bar according to the progress inside the current rank', () => {
    const { getByTestId } = render(<ImpactRankBand status={getImpactRankStatus(POINTS)} />);

    expect(styleOf(getByTestId, 'impact-rank-progress-fill').width).toBe(
      `${String(PROGRESS_PERCENT)}%`,
    );
  });

  it('celebrates the highest rank with a full bar and no next rank to chase', () => {
    const { getByText, getByTestId, queryByText } = render(
      <ImpactRankBand status={getImpactRankStatus(LAST_RANK.minPoints + 1)} />,
    );

    expect(getByText(LAST_RANK.name)).toBeTruthy();
    expect(getByText('Rang maximum atteint, tu es au sommet')).toBeTruthy();
    expect(queryByText(/Plus que/)).toBeNull();
    expect(styleOf(getByTestId, 'impact-rank-progress-fill').width).toBe('100%');
  });

  it('spans the full width: no side margin and no rounded corners', () => {
    const { getByTestId } = render(<ImpactRankBand status={getImpactRankStatus(POINTS)} />);

    const style = styleOf(getByTestId, 'impact-rank-band');

    expect(style.marginHorizontal ?? 0).toBe(0);
    expect(style.borderRadius ?? 0).toBe(0);
  });

  it('opens the ranks page when pressed', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(
      <ImpactRankBand status={getImpactRankStatus(POINTS)} onPress={onPress} />,
    );

    fireEvent.press(getByLabelText('Voir tous les rangs'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the green of the theme as background', () => {
    const { getByTestId } = render(<ImpactRankBand status={getImpactRankStatus(POINTS)} />);

    expect(styleOf(getByTestId, 'impact-rank-band').backgroundColor).toBe(
      lightTheme.colors.primaryEco,
    );
  });
});
