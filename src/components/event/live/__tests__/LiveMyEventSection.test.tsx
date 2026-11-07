import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react-native';
import * as mockExpoImage from './expo-image.mock';
import { createLiveEvent } from '@/api/event/__tests__/live-event.factory';
import type { LiveSharingState } from '@/hooks/live-sharing.types';
import { LiveMyEventSection } from '../LiveMyEventSection';
import { createSharingState } from './live-sharing.factory';

jest.mock('expo-image', () => mockExpoImage);

const CONSENT =
  "Partager ma position avec l'organisateur jusqu'à mon arrivée. Position approximative (environ 100 m), visible de l'organisateur seul, jamais conservée.";

const renderSection = (options: {
  isOrganizer?: boolean;
  sharing?: LiveSharingState;
  onToggleSharing?: jest.Mock;
  onLeave?: jest.Mock;
}) => {
  const event = createLiveEvent({ id: 'evt-1' });
  const onToggleSharing = options.onToggleSharing ?? jest.fn();
  const onLeave = options.onLeave ?? jest.fn();
  render(
    <LiveMyEventSection
      items={[{ event, isOrganizer: options.isOrganizer ?? false }]}
      onShowRoute={jest.fn()}
      onOpenDetail={jest.fn()}
      onLeave={onLeave}
      sharing={options.sharing ?? createSharingState()}
      onToggleSharing={onToggleSharing}
    />,
  );
  return { event, onToggleSharing, onLeave };
};

describe('LiveMyEventSection sharing toggle', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('shows the exact consent text and a switch that is off by default', () => {
    renderSection({});

    expect(screen.getByText(CONSENT)).toBeTruthy();
    expect(screen.getByText("Partager ma position avec l'organisateur")).toBeTruthy();
    expect(screen.getByTestId('live-sharing-switch-evt-1').props.value).toBe(false);
    expect(screen.queryByTestId('live-sharing-active-evt-1')).toBeNull();
  });

  it('is absent for the organiser (D20)', () => {
    renderSection({ isOrganizer: true });

    expect(screen.queryByTestId('live-sharing-evt-1')).toBeNull();
    expect(screen.queryByText(CONSENT)).toBeNull();
  });

  it('asks to start sharing when the switch is turned on', () => {
    const { event, onToggleSharing } = renderSection({});

    fireEvent(screen.getByTestId('live-sharing-switch-evt-1'), 'valueChange', true);

    expect(onToggleSharing).toHaveBeenCalledWith(event, true);
  });

  it('shows an active indicator and an on switch while sharing, and can turn it off', () => {
    const { event, onToggleSharing } = renderSection({
      sharing: createSharingState({ status: 'sharing', activeEventId: 'evt-1' }),
    });

    expect(screen.getByTestId('live-sharing-switch-evt-1').props.value).toBe(true);
    expect(screen.getByTestId('live-sharing-active-evt-1')).toBeTruthy();
    fireEvent(screen.getByTestId('live-sharing-switch-evt-1'), 'valueChange', false);
    expect(onToggleSharing).toHaveBeenCalledWith(event, false);
  });

  it('disables the switch while starting', () => {
    renderSection({ sharing: createSharingState({ status: 'starting', activeEventId: 'evt-1' }) });

    expect(screen.getByTestId('live-sharing-switch-evt-1').props.disabled).toBe(true);
  });

  it('does not show sharing as active for another event', () => {
    renderSection({ sharing: createSharingState({ status: 'sharing', activeEventId: 'other' }) });

    expect(screen.getByTestId('live-sharing-switch-evt-1').props.value).toBe(false);
    expect(screen.queryByTestId('live-sharing-active-evt-1')).toBeNull();
  });

  it('tells the user why sharing stopped on arrival', () => {
    renderSection({
      sharing: createSharingState({ lastStop: { eventId: 'evt-1', reason: 'ARRIVED' } }),
    });

    expect(
      screen.getByText('Vous êtes arrivé : le partage de votre position est arrêté.'),
    ).toBeTruthy();
  });

  it('tells the user that sharing was stopped', () => {
    renderSection({
      sharing: createSharingState({ lastStop: { eventId: 'evt-1', reason: 'STOPPED' } }),
    });

    expect(screen.getByTestId('live-sharing-stopped-evt-1')).toBeTruthy();
  });

  it('shows an error message when sharing could not start', () => {
    renderSection({ sharing: createSharingState({ status: 'error', activeEventId: 'evt-1' }) });

    expect(screen.getByText("Impossible d'activer le partage de position.")).toBeTruthy();
  });
});

describe('LiveMyEventSection actions', () => {
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('has no "Mes évts" button', () => {
    renderSection({});

    expect(screen.queryByText('Mes évts')).toBeNull();
  });

  it('shows a labelled route icon and a labelled detail icon for a participant', () => {
    renderSection({});

    expect(screen.getByLabelText('Comment y aller')).toBeTruthy();
    expect(screen.getByLabelText("Voir le détail de l'événement")).toBeTruthy();
  });

  it('shows the detail icon but no route icon for the organiser', () => {
    renderSection({ isOrganizer: true });

    expect(screen.queryByLabelText('Comment y aller')).toBeNull();
    expect(screen.getByLabelText("Voir le détail de l'événement")).toBeTruthy();
  });

  it('asks to leave the event from a participant', () => {
    const { event, onLeave } = renderSection({});

    fireEvent.press(screen.getByText("Quitter l'événement"));

    expect(onLeave).toHaveBeenCalledWith(event);
  });

  it('offers no leave button to the organiser', () => {
    renderSection({ isOrganizer: true });

    expect(screen.queryByText("Quitter l'événement")).toBeNull();
  });
});
