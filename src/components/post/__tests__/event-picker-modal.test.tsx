import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import * as getEventsModule from '@/api/event/hooks/use-get-events';
import { EventPickerModal } from '../event-picker-modal';
import { createMockAppEvent } from './event.factory';
import { mockOnClear, mockOnClose, mockOnPreview, mockOnSelect } from './event-picker-modal.mock';

const renderModal = (selectedEventId?: string) =>
  render(
    <EventPickerModal
      visible
      selectedEventId={selectedEventId}
      onClose={mockOnClose}
      onSelect={mockOnSelect}
      onClear={mockOnClear}
      onPreview={mockOnPreview}
    />,
  );

describe('EventPickerModal', () => {
  let useGetEventsSpy: jest.SpyInstance;

  beforeEach(() => {
    useGetEventsSpy = jest.spyOn(getEventsModule, 'useGetEvents');
    useGetEventsSpy.mockReturnValue({
      data: {
        pages: [
          {
            events: [
              createMockAppEvent({ id: 'a', title: 'Nettoyage des berges' }),
              createMockAppEvent({ id: 'b', title: 'Collecte de dons' }),
            ],
            totalCount: 2,
          },
        ],
        pageParams: [1],
      },
      isLoading: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('proposes every event, not only the ones created by the user', () => {
    const { getByText } = renderModal();

    expect(getByText('Nettoyage des berges')).toBeTruthy();
    expect(getByText('Collecte de dons')).toBeTruthy();
    expect(useGetEventsSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ organizerId: 'me' }),
    );
  });

  it('filters by name on the server once the typing stops', async () => {
    const { getByPlaceholderText } = renderModal();

    fireEvent.changeText(getByPlaceholderText('Rechercher par nom...'), '  collecte ');

    await waitFor(() => {
      expect(useGetEventsSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({ searchTerm: 'collecte' }),
      );
    });
  });

  it('does not query for each keystroke', () => {
    const { getByPlaceholderText } = renderModal();
    const input = getByPlaceholderText('Rechercher par nom...');

    fireEvent.changeText(input, 'col');
    fireEvent.changeText(input, 'collecte');

    expect(useGetEventsSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ searchTerm: 'col' }),
    );
  });

  it('selects the pressed event', () => {
    const { getByText } = renderModal();

    fireEvent.press(getByText('Collecte de dons'));

    expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'b' }));
  });

  it('says so when no event matches the search', () => {
    useGetEventsSpy.mockReturnValue({
      data: { pages: [{ events: [], totalCount: 0 }], pageParams: [1] },
      isLoading: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });
    const { getByPlaceholderText, getByText } = renderModal();

    fireEvent.changeText(getByPlaceholderText('Rechercher par nom...'), 'zzz');

    expect(getByText('Aucun résultat trouvé')).toBeTruthy();
  });
});
