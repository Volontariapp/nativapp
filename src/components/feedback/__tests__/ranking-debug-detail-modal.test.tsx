import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { RankingDebugDetailModal } from '../RankingDebugDetailModal';
import { ThemeProvider } from '@/context/ThemeContext';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider>{ui}</ThemeProvider>);
};

describe('RankingDebugDetailModal', () => {
  const defaultProps = {
    visible: true,
    onClose: jest.fn(),
    type: 'post' as const,
    id: 'post-12345678-abcd',
    title: 'Super nettoyage de plage',
    rankingScore: 0.64251789,
    reasons: ['FOLLOWED_AUTHOR' as const, 'RECENT' as const],
    isFallback: false,
    isLiked: false,
    authorPseudo: 'alice',
    createdAt: new Date('2026-10-22T08:00:00.000Z'),
  };

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders exact unrounded score and badge score', () => {
    const { getByText } = renderWithTheme(<RankingDebugDetailModal {...defaultProps} />);

    // Exact score check
    expect(getByText('0.64251789')).toBeTruthy();
    // Rounded score check
    expect(getByText('0.6425')).toBeTruthy();
    // Relative percentage check (~64.25 %)
    expect(getByText('64.25 %')).toBeTruthy();
    // Title & ID
    expect(getByText('Super nettoyage de plage')).toBeTruthy();
    expect(getByText('post-12345678-abcd')).toBeTruthy();
  });

  it('renders dominant reasons with descriptions and formula details', () => {
    const { getByText } = renderWithTheme(<RankingDebugDetailModal {...defaultProps} />);

    expect(getByText('Organisateur suivi')).toBeTruthy();
    expect(getByText('[FOLLOWED_AUTHOR]')).toBeTruthy();
    expect(getByText('Vous êtes abonné au profil de cet auteur.')).toBeTruthy();

    expect(getByText('Nouveau')).toBeTruthy();
    expect(getByText('[RECENT]')).toBeTruthy();
    expect(getByText('Publication très récente sur la plateforme.')).toBeTruthy();
  });

  it('renders penalty notice when post was already liked', () => {
    const { getByText } = renderWithTheme(
      <RankingDebugDetailModal {...defaultProps} isLiked={true} />,
    );

    expect(getByText(/Rétrogradé × 0.6 : vous avez déjà interagi avec ce post/i)).toBeTruthy();
  });

  it('renders fallback notice when isFallback is true', () => {
    const { getByText } = renderWithTheme(
      <RankingDebugDetailModal
        {...defaultProps}
        rankingScore={undefined}
        reasons={[]}
        isFallback={true}
      />,
    );

    expect(getByText(/Repli chronologique activé/i)).toBeTruthy();
    expect(getByText(/démarrage à froid/i)).toBeTruthy();
  });

  it('renders event scoring weights when type is event', () => {
    const { getByText } = renderWithTheme(
      <RankingDebugDetailModal
        {...defaultProps}
        type="event"
        eventType="ECOLOGY"
        localisationName="Marseille Vieux-Port"
        distanceKm={12.4}
      />,
    );

    expect(getByText('ÉVÉNEMENT')).toBeTruthy();
    expect(getByText('Scoring des Événements')).toBeTruthy();
    expect(getByText('Proximité géographique')).toBeTruthy();
    expect(getByText('27%')).toBeTruthy();
    expect(getByText('12.4 km')).toBeTruthy();
    expect(getByText('Marseille Vieux-Port')).toBeTruthy();
  });

  it('calls onClose when close icon or button is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText, getByText } = renderWithTheme(
      <RankingDebugDetailModal {...defaultProps} onClose={onClose} />,
    );

    fireEvent.press(getByLabelText('Fermer'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.press(getByText('Fermer'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
