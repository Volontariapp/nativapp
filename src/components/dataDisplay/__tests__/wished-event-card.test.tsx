import React from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { WishedEventCard } from '../WishedEventCard';
import { EventType, EventState } from '@volontariapp/contracts';
import type { AppEvent } from '@/api/event/event.api';
import type * as ReactNavigationNative from '@react-navigation/native';

const mockNavigate = jest.fn();
const mockUnwish = jest.fn();
const mockParticipate = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
    }),
  };
});

jest.mock('@/api/social/hooks/use-user-social-actions', () => ({
  useUserSocialActions: () => ({
    unwish: mockUnwish,
    participate: mockParticipate,
    isUnwishing: false,
    isParticipating: false,
  }),
}));

describe('WishedEventCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createTestEvent = (type: EventType, title = 'Event Test'): AppEvent => ({
    id: 'test-event-id',
    title,
    description: 'Description',
    startAt: '2026-10-30T10:00:00.000Z',
    endAt: '2026-10-30T12:00:00.000Z',
    localisationName: 'Paris 11e',
    type,
    state: EventState.EVENT_STATE_PUBLISHED,
    awardedImpactScore: 10,
    maxParticipants: 50,
    currentParticipants: 5,
  });

  it('renders a social event with green participate button and blue swipe background', () => {
    const socialEvent = createTestEvent(EventType.EVENT_TYPE_SOCIAL, 'Maraude Solidaire');
    const { getByLabelText, getByText } = render(
      <WishedEventCard event={socialEvent} variant="A" />,
    );

    expect(getByText('Maraude Solidaire')).toBeTruthy();
    const button = getByLabelText('Participer à Maraude Solidaire');
    expect(button).toBeTruthy();

    // Le bouton Participer doit toujours être vert (#2f6e3e)
    const style = StyleSheet.flatten<ViewStyle>(button.props.style as ViewStyle);
    expect(style.backgroundColor).toBe('#2f6e3e');
  });

  it('renders an ecology event with green participate button and green swipe background', () => {
    const ecoEvent = createTestEvent(EventType.EVENT_TYPE_ECOLOGY, 'Ramassage Déchets');
    const { getByLabelText, getByText } = render(<WishedEventCard event={ecoEvent} variant="A" />);

    expect(getByText('Ramassage Déchets')).toBeTruthy();
    const button = getByLabelText('Participer à Ramassage Déchets');
    expect(button).toBeTruthy();

    // Le bouton Participer doit toujours être vert (#2f6e3e)
    const style = StyleSheet.flatten<ViewStyle>(button.props.style as ViewStyle);
    expect(style.backgroundColor).toBe('#2f6e3e');
  });

  it('navigates to EventDetail when the card is pressed', () => {
    const event = createTestEvent(EventType.EVENT_TYPE_SOCIAL, 'Atelier Numérique');
    const { getByText } = render(<WishedEventCard event={event} variant="A" />);

    fireEvent.press(getByText('Atelier Numérique'));
    expect(mockNavigate).toHaveBeenCalledWith('EventDetail', { event });
  });

  it('triggers participate on pressing the participate button', () => {
    const event = createTestEvent(EventType.EVENT_TYPE_ECOLOGY, 'Nettoyage Berges');
    const { getByLabelText } = render(<WishedEventCard event={event} variant="A" />);

    fireEvent.press(getByLabelText('Participer à Nettoyage Berges'));
    expect(mockParticipate).toHaveBeenCalledWith('test-event-id');
  });

  it('triggers unwish on pressing the unwish button', () => {
    const event = createTestEvent(EventType.EVENT_TYPE_SOCIAL, 'Distribution Vêtements');
    const { getByLabelText } = render(<WishedEventCard event={event} variant="A" />);

    fireEvent.press(getByLabelText('Retirer Distribution Vêtements de la wishlist'));
    expect(mockUnwish).toHaveBeenCalledWith('test-event-id');
  });
});
