import React from 'react';
import { cleanup, render, screen } from '@testing-library/react-native';
import { createLiveEvent } from '@/api/event/__tests__/live-event.factory';
import { getFakeEcologyImage } from '@/utils/fake-images.util';
import * as mockExpoImage from './expo-image.mock';
import { LiveEventCard } from '../LiveEventCard';

jest.mock('expo-image', () => mockExpoImage);

describe('LiveEventCard', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('shows the cover photo when the event has one', () => {
    const event = createLiveEvent({ id: 'a', coverUrl: 'https://cdn.test/cover.jpg' });
    render(<LiveEventCard event={event} />);

    expect(screen.getByLabelText('https://cdn.test/cover.jpg')).toBeTruthy();
  });

  it('falls back to the app placeholder image without a cover', () => {
    const event = createLiveEvent({ id: 'a', coverUrl: undefined });
    render(<LiveEventCard event={event} />);

    expect(screen.getByTestId('live-event-cover')).toBeTruthy();
    expect(screen.getByLabelText(getFakeEcologyImage('a'))).toBeTruthy();
  });

  it('shows title, in-progress status, participants, walking time and remaining time', () => {
    const event = createLiveEvent({
      title: 'Berges',
      maxParticipants: 20,
      currentParticipants: 8,
    });
    render(<LiveEventCard event={event} walkSeconds={420} />);

    expect(screen.getByText('Berges')).toBeTruthy();
    expect(screen.getByTestId('event-status-badge')).toBeTruthy();
    expect(screen.getByText('8/20')).toBeTruthy();
    expect(screen.getByText('7 min')).toBeTruthy();
    expect(screen.getByText(/^Fin dans/)).toBeTruthy();
  });

  it('mentions the estimate and the rank', () => {
    render(<LiveEventCard event={createLiveEvent()} walkSeconds={300} isEstimated rank={2} />);

    expect(screen.getByText('5 min (estimé)')).toBeTruthy();
    expect(screen.getByText('2.')).toBeTruthy();
  });

  it('shows no walking time when none is given', () => {
    render(<LiveEventCard event={createLiveEvent()} />);

    expect(screen.queryByText(/min$/)).toBeNull();
  });
});
