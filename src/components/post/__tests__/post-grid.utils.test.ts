import { POST_GRID_COLUMNS, POST_GRID_GAP, computePostGridTileSize } from '../post-grid.utils';

describe('computePostGridTileSize', () => {
  it('fits three tiles and four gaps of 1px in a 390px wide screen', () => {
    expect(computePostGridTileSize(390)).toBe(128);
  });

  it.each([320, 375, 390, 414, 430, 768])('never overflows a %ipx wide screen', (width) => {
    const size = computePostGridTileSize(width);
    const used = POST_GRID_COLUMNS * size + (POST_GRID_COLUMNS + 1) * POST_GRID_GAP;

    expect(used).toBeLessThanOrEqual(width);
    expect(width - used).toBeLessThan(POST_GRID_COLUMNS);
  });
});
