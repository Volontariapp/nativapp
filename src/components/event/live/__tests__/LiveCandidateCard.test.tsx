import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import { createLiveEvent } from '@/api/event/__tests__/live-event.factory';
import type { LiveEventCandidate } from '@/api/event/live-events.utils';
import * as mockExpoImage from './expo-image.mock';
import { LiveCandidateCard } from '../LiveCandidateCard';

jest.mock('expo-image', () => mockExpoImage);

const candidate: LiveEventCandidate = {
  event: createLiveEvent({ id: 'evt-1', title: 'Berges' }),
  distanceMeters: 400,
  walkSeconds: 300,
  availability: 'JOINABLE',
  isEstimated: false,
};

const renderCard = () => {
  const handlers = {
    onParticipate: jest.fn(),
    onSelect: jest.fn(),
    onOpenDetail: jest.fn(),
  };
  render(
    <LiveCandidateCard candidate={candidate} rank={1} isParticipating={false} {...handlers} />,
  );
  return handlers;
};

describe('LiveCandidateCard', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('shows a route icon labelled "Comment y aller" that selects the route', () => {
    const { onSelect } = renderCard();

    fireEvent.press(screen.getByLabelText('Comment y aller'));

    expect(onSelect).toHaveBeenCalledWith(candidate);
  });

  it('shows a detail icon with an accessible label that opens the detail', () => {
    const { onOpenDetail } = renderCard();

    fireEvent.press(screen.getByLabelText("Voir le détail de l'événement"));

    expect(onOpenDetail).toHaveBeenCalledWith(candidate);
  });

  it('has no text buttons for the route or the detail any more', () => {
    renderCard();

    expect(screen.queryByText('Trajet')).toBeNull();
    expect(screen.queryByText('Détail')).toBeNull();
  });

  it('participates through the button', () => {
    const { onParticipate } = renderCard();

    fireEvent.press(screen.getByTestId('live-participate-evt-1'));

    expect(onParticipate).toHaveBeenCalledWith(candidate);
  });
});
