import React from 'react';
import { render } from '@testing-library/react-native';
import { BadgeCatalogProgress } from '../badge-catalog-progress';
import { createBadgeProgress } from './badge-progress.factory';

describe('BadgeCatalogProgress', () => {
  it('shows the percentage, the reward and what is left to do', () => {
    const { getByText } = render(<BadgeCatalogProgress progress={createBadgeProgress()} />);

    expect(getByText('60 %')).toBeTruthy();
    expect(getByText('Récompense : +250 pts')).toBeTruthy();
    expect(getByText('3 / 5 événements terminés')).toBeTruthy();
  });

  it('lists every requirement of a badge that needs several', () => {
    const { getByText } = render(
      <BadgeCatalogProgress
        progress={createBadgeProgress({
          slug: 'EVENT_HYBRID_ECO_SOCIAL_TIER_1',
          percent: 50,
          requirements: [
            { metric: 'EVENTS_FINISHED_SOCIAL', current: 5, target: 5 },
            { metric: 'EVENTS_FINISHED_ECOLOGY', current: 0, target: 5 },
          ],
        })}
      />,
    );

    expect(getByText('5 / 5 événements socio terminés')).toBeTruthy();
    expect(getByText('0 / 5 événements éco terminés')).toBeTruthy();
  });

  it('exposes the progress to assistive technologies', () => {
    const { getByRole } = render(<BadgeCatalogProgress progress={createBadgeProgress()} />);

    expect(getByRole('progressbar').props.accessibilityValue).toEqual({ min: 0, max: 100, now: 60 });
  });

  it('draws a bar for the badge', () => {
    const { getByTestId } = render(<BadgeCatalogProgress progress={createBadgeProgress()} />);

    expect(getByTestId('badge-progress-EVENT_PARTICIPATION_TIER_2')).toBeTruthy();
  });
});
