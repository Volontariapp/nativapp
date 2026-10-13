import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventPreviewModal } from '../event-preview-modal';
import { createMockAppEvent } from './event.factory';
import { mockOnClose } from './event-selector.mock';
import { EventType } from '@volontariapp/contracts';

describe('EventPreviewModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders modal with event details when event is provided', () => {
    const mockEvent = createMockAppEvent({
      title: 'Collecte de vêtements',
      description: 'Distribution solidaire dans le 11ème arrondissement.',
      localisationName: 'Place de la République',
      type: EventType.EVENT_TYPE_SOCIAL,
      awardedImpactScore: 75,
      maxParticipants: 15,
      currentParticipants: 5,
    });

    const { getByText } = render(
      <EventPreviewModal visible={true} event={mockEvent} onClose={mockOnClose} />,
    );

    expect(getByText('Collecte de vêtements')).toBeTruthy();
    expect(getByText('Distribution solidaire dans le 11ème arrondissement.')).toBeTruthy();
    expect(getByText('Place de la République')).toBeTruthy();
    expect(getByText('Social')).toBeTruthy();
    expect(getByText('+75 pts d\'impact')).toBeTruthy();
    expect(getByText('5/15 participants')).toBeTruthy();
  });

  it('calls onClose when close action is triggered', () => {
    const mockEvent = createMockAppEvent();

    const { getByText } = render(
      <EventPreviewModal visible={true} event={mockEvent} onClose={mockOnClose} />,
    );

    const closeButton = getByText("Fermer l'aperçu");
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
