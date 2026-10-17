import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import type { AppEvent } from '@/api/event/event.api';
import { createEvent } from './event-app.factory';
import * as mockEventCard from './event-card-stub.mock';
import { MyEventItem } from '../my-event-item';

jest.mock('@/components/dataDisplay/EventCard', () => mockEventCard);

const mockOnPress = jest.fn();
const mockOnEdit = jest.fn();

const renderItem = (event: AppEvent = createEvent()) =>
  render(<MyEventItem event={event} onPress={mockOnPress} onEdit={mockOnEdit} />);

describe('MyEventItem', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('shows the status of the event', () => {
    const { getByTestId } = renderItem();

    expect(getByTestId('event-status-badge')).toBeTruthy();
  });

  it('opens the event when its card is pressed', () => {
    const { getByLabelText } = renderItem();

    fireEvent.press(getByLabelText('Carte Maraude du samedi'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it('opens the edit screen from the button on the side', () => {
    const { getByLabelText } = renderItem();

    fireEvent.press(getByLabelText("Modifier l'évènement Maraude du samedi"));

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnPress).not.toHaveBeenCalled();
  });
});
