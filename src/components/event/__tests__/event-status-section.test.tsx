import React from 'react';
import { render } from '@testing-library/react-native';
import { lightTheme } from '@/shared/themes/theme';
import { EventStatusSectionHeader } from '../event-status-section-header';
import { getStatusSectionStyle } from '../event-status-section.utils';

describe('getStatusSectionStyle', () => {
  it.each([
    ['Annulé', 'x-circle', lightTheme.colors.badgeRed],
    ['Terminé', 'check-circle', lightTheme.colors.badgeGreen],
    ['En cours', 'play-circle', lightTheme.colors.primarySocio],
    ['À venir', 'clock', lightTheme.colors.warning],
    ['Brouillon', 'edit-3', lightTheme.colors.grey],
  ])('gives %s the %s icon and its own color', (title, icon, color) => {
    expect(getStatusSectionStyle(title, lightTheme)).toEqual({ icon, color });
  });

  it('keeps an unknown status neutral', () => {
    expect(getStatusSectionStyle('Inconnu', lightTheme)).toEqual({
      icon: 'help-circle',
      color: lightTheme.colors.grey,
    });
  });

  it('uses a different color for each known status', () => {
    const colors = ['En cours', 'À venir', 'Terminé', 'Annulé'].map(
      (title) => getStatusSectionStyle(title, lightTheme).color,
    );

    expect(new Set(colors).size).toBe(colors.length);
  });
});

describe('EventStatusSectionHeader', () => {
  it('shows the status title and how many events it holds', () => {
    const { getByText } = render(<EventStatusSectionHeader title="À venir" count={2} />);

    expect(getByText('À venir')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });
});
