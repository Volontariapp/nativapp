import { lightTheme } from '@/shared/themes/theme';
import { buildRankFrameStyle } from '../use-rank-frame-style';

const GLOBAL_FIRST = { scope: 'global', tier: 1 } as const;

describe('buildRankFrameStyle', () => {
  it('draws a rounded frame with a glow for a medium frame', () => {
    const style = buildRankFrameStyle(lightTheme, GLOBAL_FIRST, 'medium');

    expect(style).toMatchObject({
      borderColor: lightTheme.colors.gold,
      borderWidth: 2,
      borderRadius: lightTheme.radius.md,
      backgroundColor: lightTheme.colors.goldBackground,
      shadowColor: lightTheme.colors.gold,
    });
  });

  it('draws square corners and no glow for a banner', () => {
    const style = buildRankFrameStyle(lightTheme, GLOBAL_FIRST, 'medium', { squared: true });

    expect(style).toMatchObject({
      borderColor: lightTheme.colors.gold,
      borderWidth: 2,
      borderRadius: 0,
      backgroundColor: lightTheme.colors.goldBackground,
    });
    expect(style.shadowColor).toBeUndefined();
    expect(style.shadowRadius).toBeUndefined();
  });

  it('keeps a thin frame plain, rounded or squared', () => {
    expect(buildRankFrameStyle(lightTheme, GLOBAL_FIRST, 'thin')).toEqual({
      borderColor: lightTheme.colors.gold,
      borderWidth: 1,
      borderRadius: lightTheme.radius.md,
    });
    expect(buildRankFrameStyle(lightTheme, GLOBAL_FIRST, 'thin', { squared: true })).toMatchObject({
      borderRadius: 0,
    });
  });
});
