import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ManageHubFilters } from '../ManageHubFilters';
import type { ManageTabType } from '../manage-hub.utils';

const setup = (activeTab: ManageTabType = 'participated') => {
  const handlers = {
    onTabChange: jest.fn(),
    onScopeChange: jest.fn(),
    onTypeFilterChange: jest.fn(),
  };
  const utils = render(
    <ManageHubFilters
      activeTab={activeTab}
      participatedCount={3}
      wishedCount={5}
      myEventsCount={2}
      participatedScope="all"
      liveCount={1}
      upcomingCount={2}
      typeFilter="all"
      {...handlers}
    />,
  );
  return { ...utils, ...handlers };
};

describe('ManageHubFilters', () => {
  it('renders the three tabs with their counters and switches tab on press', () => {
    const { getByLabelText, onTabChange } = setup();

    fireEvent.press(getByLabelText('Wishlist, 5 événements'));
    fireEvent.press(getByLabelText('Créés, 2 événements'));
    fireEvent.press(getByLabelText('En cours, 3 événements'));

    expect(onTabChange.mock.calls).toEqual([['wished'], ['created'], ['participated']]);
  });

  it('shows the period sub-filters only on the participated tab', () => {
    const participated = setup('participated');
    expect(participated.getByText('Toutes (3)')).toBeTruthy();
    expect(participated.getByText('En direct (1)')).toBeTruthy();
    expect(participated.getByText('À venir (2)')).toBeTruthy();
    participated.unmount();

    const wished = setup('wished');
    expect(wished.queryByText('Toutes (3)')).toBeNull();
  });

  it('changes the scope', () => {
    const { getByText, onScopeChange } = setup();

    fireEvent.press(getByText('Toutes (3)'));
    fireEvent.press(getByText('En direct (1)'));
    fireEvent.press(getByText('À venir (2)'));

    expect(onScopeChange.mock.calls).toEqual([['all'], ['live'], ['upcoming']]);
  });

  it('changes the type filter', () => {
    const { getByText, onTypeFilterChange } = setup();

    fireEvent.press(getByText('Tous'));
    fireEvent.press(getByText('Écologie'));
    fireEvent.press(getByText('Social'));

    expect(onTypeFilterChange.mock.calls).toEqual([['all'], ['ecology'], ['social']]);
  });

  it('toggles an active type filter back to all', () => {
    const onTypeFilterChange = jest.fn();
    const { getByText } = render(
      <ManageHubFilters
        activeTab="wished"
        onTabChange={jest.fn()}
        participatedCount={0}
        wishedCount={0}
        myEventsCount={0}
        participatedScope="all"
        onScopeChange={jest.fn()}
        liveCount={0}
        upcomingCount={0}
        typeFilter="ecology"
        onTypeFilterChange={onTypeFilterChange}
      />,
    );

    fireEvent.press(getByText('Écologie'));
    expect(onTypeFilterChange).toHaveBeenCalledWith('all');
  });
});
