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

  it('keeps a thin frame plain: border only, no tint and no glow', () => {
    expect(buildRankFrameStyle(lightTheme, GLOBAL_FIRST, 'thin')).toEqual({
      borderColor: lightTheme.colors.gold,
      borderWidth: 1,
      borderRadius: lightTheme.radius.md,
    });
  });
});
