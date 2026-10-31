import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EventScoringInfoModal } from '../EventScoringInfoModal';

describe('EventScoringInfoModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    maxEstimatedPoints: 340,
    organizerPoints: 300,
    durationHours: 3,
    maxParticipants: 15,
  };

  it('renders simulation metrics and scoring rules correctly', () => {
    const { getByText } = render(<EventScoringInfoModal {...defaultProps} />);

    expect(getByText("Points d'impact & Récompenses")).toBeTruthy();
    expect(getByText("Jusqu'à +340 pts")).toBeTruthy();
    expect(getByText('+300 pts')).toBeTruthy();
    expect(getByText('Basé sur 3h et 15 participants attendus.')).toBeTruthy();

    expect(getByText('Durée de la mission')).toBeTruthy();
    expect(getByText('Émargement obligatoire')).toBeTruthy();
    expect(getByText('Prime de réactivité')).toBeTruthy();
    expect(getByText('Protection anti-triche créateur')).toBeTruthy();
  });

  it('calls onClose when "J\'ai compris" button is clicked', () => {
    const onClose = jest.fn();
    const { getByText } = render(<EventScoringInfoModal {...defaultProps} onClose={onClose} />);

    fireEvent.press(getByText("J'ai compris"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
