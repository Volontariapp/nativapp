import {
  DETAIL_COVER_HEIGHT,
  LIST_THUMBNAIL_SIZE,
  MAP_THUMBNAIL_SIZE,
  computeEventImageFrames,
  computeSwipeLayout,
  fitFrame,
  type EventImageFramesInput,
} from '../event-image-frames';

const input = (overrides: Partial<EventImageFramesInput> = {}): EventImageFramesInput => ({
  windowWidth: 390,
  windowHeight: 844,
  insetsTop: 47,
  insetsBottom: 34,
  isIos: true,
  spacingSm: 8,
  radiusMd: 12,
  ...overrides,
});

describe('computeSwipeLayout', () => {
  it('stacks the buttons and the cards above the tab bar on iOS', () => {
    expect(computeSwipeLayout({ insetsBottom: 34, isIos: true })).toEqual({
      tabBarHeight: 64,
      safeBottomOffset: 98,
      buttonsBottom: 108,
      swiperMarginBottom: 188,
    });
  });

  it('keeps a minimum bottom inset of 15 on iOS and uses the raw inset elsewhere', () => {
    expect(computeSwipeLayout({ insetsBottom: 0, isIos: true }).safeBottomOffset).toBe(79);
    expect(computeSwipeLayout({ insetsBottom: 0, isIos: false })).toMatchObject({
      tabBarHeight: 60,
      safeBottomOffset: 60,
    });
  });
});

describe('computeEventImageFrames', () => {
  it('describes the four frames in display order', () => {
    expect(computeEventImageFrames(input()).map((frame) => frame.id)).toEqual([
      'swipe',
      'detail',
      'list',
      'map',
    ]);
  });

  it('shares the fixed sizes with the real components', () => {
    const [, detail, list, map] = computeEventImageFrames(input());

    expect(detail).toMatchObject({ width: 390, height: DETAIL_COVER_HEIGHT });
    expect(list).toMatchObject({ width: LIST_THUMBNAIL_SIZE, height: LIST_THUMBNAIL_SIZE });
    expect(map).toMatchObject({ width: MAP_THUMBNAIL_SIZE, height: MAP_THUMBNAIL_SIZE });
  });

  it('gives the swipe card a portrait frame that follows the screen', () => {
    const [swipe] = computeEventImageFrames(input());

    expect(swipe?.width).toBe(374);
    expect(swipe?.height).toBeGreaterThan(swipe?.width ?? 0);
    expect(computeEventImageFrames(input({ windowHeight: 600 }))[0]?.height).toBeLessThan(
      swipe?.height ?? 0,
    );
  });

  it('never returns an empty swipe frame on a tiny screen', () => {
    expect(computeEventImageFrames(input({ windowHeight: 100 }))[0]?.height).toBe(1);
  });
});

describe('fitFrame', () => {
  const box = { maxWidth: 220, maxHeight: 150 };

  it('shrinks a frame to fit the box and keeps its ratio', () => {
    expect(fitFrame({ width: 390, height: 200 }, box)).toEqual({ width: 220, height: 113 });
  });

  it('shrinks a tall frame by its height', () => {
    expect(fitFrame({ width: 374, height: 500 }, box)).toEqual({ width: 112, height: 150 });
  });

  it('never enlarges a small frame', () => {
    expect(fitFrame({ width: 70, height: 70 }, box)).toEqual({ width: 70, height: 70 });
  });
});
