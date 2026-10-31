import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { createUserWeb } from '@/api/user/__tests__/user.factory';
import { ParticipantCard } from '../ParticipantCard';

jest.mock('expo-image', () => ({ Image: 'Image' }));

describe('ParticipantCard', () => {
  const participant = createUserWeb({
    id: 'user-123',
    pseudo: 'SuperVolunteer',
    totalImpactScore: 450,
    email: 'volunteer@test.com',
  });

  it('renders participant details correctly', () => {
    const { getByText } = render(<ParticipantCard participant={participant} />);

    expect(getByText('SuperVolunteer')).toBeTruthy();
    expect(getByText('450 pts')).toBeTruthy();
    expect(getByText('volunteer@test.com')).toBeTruthy();
  });

  it('displays "Émarger" button when canCheckIn is true and not yet checked in', () => {
    const onToggleCheckIn = jest.fn();
    const { getByText } = render(
      <ParticipantCard
        participant={participant}
        canCheckIn={true}
        isCheckedIn={false}
        onToggleCheckIn={onToggleCheckIn}
      />,
    );

    const button = getByText('Émarger');
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(onToggleCheckIn).toHaveBeenCalledTimes(1);
  });

  it('displays "Présent" button when canCheckIn is true and already checked in', () => {
    const onToggleCheckIn = jest.fn();
    const { getByText } = render(
      <ParticipantCard
        participant={participant}
        canCheckIn={true}
        isCheckedIn={true}
        onToggleCheckIn={onToggleCheckIn}
      />,
    );

    const button = getByText('Présent');
    expect(button).toBeTruthy();
    fireEvent.press(button);
    expect(onToggleCheckIn).toHaveBeenCalledTimes(1);
  });

  it('displays read-only status badge when canCheckIn is false but isCheckedIn is provided', () => {
    const { getByText, rerender } = render(
      <ParticipantCard participant={participant} canCheckIn={false} isCheckedIn={true} />,
    );
    expect(getByText('Présent')).toBeTruthy();

    rerender(<ParticipantCard participant={participant} canCheckIn={false} isCheckedIn={false} />);
    expect(getByText('Absent')).toBeTruthy();
  });

  it('calls onPress when the card is clicked', () => {
    const onPress = jest.fn();
    const { getByTestId } = render(<ParticipantCard participant={participant} onPress={onPress} />);

    fireEvent.press(getByTestId('participant-card'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
