import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventSelector } from '../event-selector';
import { createMockAppEvent } from './event.factory';
import { mockOnSelectEvent } from './event-selector.mock';
import * as getEventModule from '@/api/event/hooks/use-get-event';

describe('EventSelector', () => {
  let useGetEventSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    useGetEventSpy = jest.spyOn(getEventModule, 'useGetEvent');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders unselected state when selectedEventId is undefined', () => {
    useGetEventSpy.mockReturnValue({ data: undefined, isLoading: false });

    const { getByText } = render(
      <EventSelector onSelectEvent={mockOnSelectEvent} selectedEventId={undefined} />,
    );

    expect(getByText('Associer un événement')).toBeTruthy();
    expect(getByText('Optionnel')).toBeTruthy();
  });

  it('renders selected event card when an event is selected', () => {
    const mockEvent = createMockAppEvent({
      id: 'event-42',
      title: 'Nettoyage des berges',
      localisationName: 'Canal Saint-Martin',
    });

    useGetEventSpy.mockReturnValue({ data: mockEvent, isLoading: false });

    const { getByText } = render(
      <EventSelector onSelectEvent={mockOnSelectEvent} selectedEventId="event-42" />,
    );

    expect(getByText('Nettoyage des berges')).toBeTruthy();
    expect(getByText('Canal Saint-Martin')).toBeTruthy();
    expect(getByText('Lié')).toBeTruthy();
    expect(getByText('Aperçu')).toBeTruthy();
    expect(getByText('Changer')).toBeTruthy();
    expect(getByText('Retirer')).toBeTruthy();
  });

  it('calls onSelectEvent with undefined when Retirer is pressed', () => {
    const mockEvent = createMockAppEvent({
      id: 'event-42',
      title: 'Nettoyage des berges',
    });

    useGetEventSpy.mockReturnValue({ data: mockEvent, isLoading: false });

    const { getByText } = render(
      <EventSelector onSelectEvent={mockOnSelectEvent} selectedEventId="event-42" />,
    );

    const removeButton = getByText('Retirer');
    fireEvent.press(removeButton);

    expect(mockOnSelectEvent).toHaveBeenCalledWith(undefined);
  });
});
