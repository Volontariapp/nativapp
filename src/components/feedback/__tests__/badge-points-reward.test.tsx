import React from 'react';
import { render } from '@testing-library/react-native';
import { BadgePointsReward } from '../badge-points-reward';

describe('BadgePointsReward', () => {
  it('shows the points won with a badge', () => {
    const { getByText } = render(<BadgePointsReward points={250} />);

    expect(getByText('+250 pts')).toBeTruthy();
  });

  it('reads the points aloud', () => {
    const { getByLabelText } = render(<BadgePointsReward points={1000} />);

    expect(getByLabelText('1000 points gagnés')).toBeTruthy();
  });
});
