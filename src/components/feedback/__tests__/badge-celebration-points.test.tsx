import React from 'react';
import { render } from '@testing-library/react-native';
import { BadgeCelebrationModal } from '../BadgeCelebrationModal';

describe('BadgeCelebrationModal points', () => {
  const renderModal = (points?: number) =>
    render(
      <BadgeCelebrationModal
        visible
        variant="EVENT_PARTICIPATION_TIER_2"
        points={points}
        onClose={jest.fn()}
      />,
    );

  it('announces the points won with the badge', () => {
    const { getByText } = renderModal(250);

    expect(getByText('+250 pts')).toBeTruthy();
  });

  it('shows no points when the server did not credit any', () => {
    const { queryByText } = renderModal(undefined);

    expect(queryByText(/pts/)).toBeNull();
  });

  it('shows no points for a zero reward', () => {
    const { queryByText } = renderModal(0);

    expect(queryByText(/pts/)).toBeNull();
  });
});
