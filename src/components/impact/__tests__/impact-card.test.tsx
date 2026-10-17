import React from 'react';
import { render } from '@testing-library/react-native';
import { ImpactCard } from '../impact-card';
import { createImpactCardProps } from './impact-card.factory';

describe('ImpactCard', () => {
  it('shows the cumulated impact score', () => {
    const { getByText } = render(
      <ImpactCard {...createImpactCardProps({ totalImpactScore: 120 })} />,
    );

    expect(getByText('Mon impact')).toBeTruthy();
    expect(getByText('120')).toBeTruthy();
  });

  it('shows the distance to the next participation badge', () => {
    const { getByText, getByTestId } = render(<ImpactCard {...createImpactCardProps()} />);

    expect(getByText('Plus que 4 événements avant le badge « Engagé·e »')).toBeTruthy();
    expect(getByTestId('impact-progress-fill').props.style).toEqual(
      expect.arrayContaining([{ width: '20%' }]),
    );
  });

  it('uses the singular when one event remains', () => {
    const { getByText } = render(
      <ImpactCard
        {...createImpactCardProps({
          progress: {
            allTiersReached: false,
            nextTier: { variant: 'EVENT_PARTICIPATION_TIER_1', name: 'Premier Pas', threshold: 1 },
            remaining: 1,
            ratio: 0,
          },
        })}
      />,
    );

    expect(getByText('Plus qu’1 événement avant le badge « Premier Pas »')).toBeTruthy();
  });

  it('celebrates when every participation badge is reached', () => {
    const { getByText, getByTestId } = render(
      <ImpactCard
        {...createImpactCardProps({
          progress: { allTiersReached: true, nextTier: null, remaining: 0, ratio: 1 },
        })}
      />,
    );

    expect(getByText('Tous les badges de participation sont débloqués')).toBeTruthy();
    expect(getByTestId('impact-progress-fill').props.style).toEqual(
      expect.arrayContaining([{ width: '100%' }]),
    );
  });

  it('shows the title and the date of the next upcoming event', () => {
    const { getByText } = render(<ImpactCard {...createImpactCardProps()} />);

    expect(getByText('Maraude du samedi')).toBeTruthy();
    expect(getByText('15 octobre 2999')).toBeTruthy();
  });

  it('explains how to continue when no event is upcoming', () => {
    const { getByText, queryByText } = render(
      <ImpactCard {...createImpactCardProps({ nextEvent: null })} />,
    );

    expect(
      getByText('Aucun événement à venir. Inscris-toi à un événement pour progresser.'),
    ).toBeTruthy();
    expect(queryByText('Maraude du samedi')).toBeNull();
  });

  it('shows a loading message instead of the content while loading', () => {
    const { getByText, queryByText } = render(
      <ImpactCard {...createImpactCardProps({ isLoading: true })} />,
    );

    expect(getByText('Chargement de ton impact...')).toBeTruthy();
    expect(queryByText('120')).toBeNull();
  });
});
