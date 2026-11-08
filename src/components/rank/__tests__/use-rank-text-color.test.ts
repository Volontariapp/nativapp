import { darkTheme, lightTheme } from '@/shared/themes/theme';
import { rankTextColor } from '../use-rank-text-color';

describe('rankTextColor', () => {
  it('turns the pseudo yellow for the global first, blue for the month first, orange for the week first', () => {
    expect(rankTextColor(lightTheme, { scope: 'global', tier: 1 })).toBe(
      lightTheme.colors.goldText,
    );
    expect(rankTextColor(lightTheme, { scope: 'month', tier: 1 })).toBe(
      lightTheme.colors.diamondText,
    );
    expect(rankTextColor(lightTheme, { scope: 'week', tier: 1 })).toBe(lightTheme.colors.flameText);
  });

  it('uses the readable text shade of the active theme', () => {
    const distinction = { scope: 'global', tier: 2 } as const;

    expect(rankTextColor(lightTheme, distinction)).toBe(lightTheme.colors.silverText);
    expect(rankTextColor(darkTheme, distinction)).toBe(darkTheme.colors.silverText);
  });
});
