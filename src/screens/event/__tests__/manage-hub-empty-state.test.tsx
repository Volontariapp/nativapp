import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import type * as ReactNative from 'react-native';
import { ManageHubEmptyState } from '../ManageHubEmptyState';
import type { ManageTabType } from '../manage-hub.utils';

jest.mock('@/components/ui/AppCalendar', () => {
  const { Pressable } = jest.requireActual<typeof ReactNative>('react-native');
  return {
    AppCalendar: ({ onDayPress }: { onDayPress: (day: { dateString: string }) => void }) => (
      <Pressable
        testID="mock-app-calendar"
        onPress={() => {
          onDayPress({ dateString: '2026-10-30' });
        }}
      />
    ),
  };
});

const setup = (activeTab: ManageTabType) => {
  const handlers = {
    onDayPress: jest.fn(),
    onExplorePress: jest.fn(),
    onCreatePress: jest.fn(),
  };
  const utils = render(
    <ManageHubEmptyState activeTab={activeTab} markedDates={{}} {...handlers} />,
  );
  return { ...utils, ...handlers };
};

describe('ManageHubEmptyState', () => {
  it('shows the calendar and the explore CTA on the participated tab', () => {
    const { getByText, getByTestId, onDayPress, onExplorePress } = setup('participated');

    expect(getByText('Aucune mission en cours')).toBeTruthy();
    fireEvent.press(getByTestId('mock-app-calendar'));
    fireEvent.press(getByText('Explorer les événements'));

    expect(onDayPress).toHaveBeenCalledWith({ dateString: '2026-10-30' });
    expect(onExplorePress).toHaveBeenCalledTimes(1);
  });

  it('shows the wishlist message and the discover CTA on the wished tab', () => {
    const { getByText, onExplorePress } = setup('wished');

    expect(getByText('Votre wishlist est vide')).toBeTruthy();
    fireEvent.press(getByText('Découvrir des missions'));

    expect(onExplorePress).toHaveBeenCalledTimes(1);
  });

  it('shows the create CTA on the created tab', () => {
    const { getByText, onCreatePress } = setup('created');

    expect(getByText('Aucun événement créé')).toBeTruthy();
    fireEvent.press(getByText('Créer un événement'));

    expect(onCreatePress).toHaveBeenCalledTimes(1);
  });
});
