import React from 'react';
import { render } from '@testing-library/react-native';
import { BADGE_REGISTRY } from '../badge.config';
import { BadgeCatalogRow } from '../badge-catalog-row';
import type { BadgeCatalogEntry } from '../badge-catalog.types';
import { createBadgeProgress } from './badge-progress.factory';

const entry = (overrides: Partial<BadgeCatalogEntry> = {}): BadgeCatalogEntry => ({
  variant: 'EVENT_PARTICIPATION_TIER_2',
  definition: BADGE_REGISTRY.EVENT_PARTICIPATION_TIER_2,
  unlocked: false,
  ...overrides,
});

describe('BadgeCatalogRow with progress', () => {
  it('shows how far a locked badge is', () => {
    const { getByText } = render(<BadgeCatalogRow entry={entry({ progress: createBadgeProgress() })} />);

    expect(getByText('60 %')).toBeTruthy();
    expect(getByText('3 / 5 événements terminés')).toBeTruthy();
  });

  it('shows the points earned by an unlocked badge instead of a progress bar', () => {
    const { getByText, queryByText } = render(
      <BadgeCatalogRow
        entry={entry({ unlocked: true, progress: createBadgeProgress({ unlocked: true, percent: 100 }) })}
      />,
    );

    expect(getByText('+250 pts gagnés')).toBeTruthy();
    expect(queryByText('100 %')).toBeNull();
    expect(queryByText(/Récompense/)).toBeNull();
  });

  it('keeps the plain row when the progress is not known yet', () => {
    const { getByText, queryByText } = render(<BadgeCatalogRow entry={entry()} />);

    expect(getByText("Comment l'obtenir")).toBeTruthy();
    expect(queryByText(/ %$/)).toBeNull();
    expect(queryByText(/pts/)).toBeNull();
  });
});
