import {
  MAX_COVER_ZOOM,
  clampZoom,
  computeBaseRegion,
  computeFrameRegion,
  computeRegion,
  panCenter,
  regionCenter,
  regionToImageStyle,
  toCropRect,
} from '../event-cover-crop';

const LANDSCAPE = { width: 4000, height: 3000 };
const PORTRAIT = { width: 3000, height: 4000 };

describe('computeBaseRegion', () => {
  it('takes the full height of a landscape photo for a square', () => {
    expect(computeBaseRegion(LANDSCAPE, 1)).toEqual({ x: 500, y: 0, width: 3000, height: 3000 });
  });

  it('takes the full width of a portrait photo for a square', () => {
    expect(computeBaseRegion(PORTRAIT, 1)).toEqual({ x: 0, y: 500, width: 3000, height: 3000 });
  });

  it('keeps the whole photo when it already has the ratio', () => {
    expect(computeBaseRegion(LANDSCAPE, 4 / 3)).toEqual({ x: 0, y: 0, width: 4000, height: 3000 });
  });
});

describe('computeRegion', () => {
  it('shrinks the region as the zoom grows', () => {
    const region = computeRegion(LANDSCAPE, 1, 2, regionCenter(computeBaseRegion(LANDSCAPE, 1)));

    expect(region).toMatchObject({ width: 1500, height: 1500 });
    expect(regionCenter(region)).toEqual({ x: 2000, y: 1500 });
  });

  it('never leaves the image when the center is pushed to a corner', () => {
    const topLeft = computeRegion(LANDSCAPE, 1, 2, { x: -1000, y: -1000 });
    const bottomRight = computeRegion(LANDSCAPE, 1, 2, { x: 9000, y: 9000 });

    expect(topLeft).toMatchObject({ x: 0, y: 0 });
    expect(bottomRight.x + bottomRight.width).toBe(4000);
    expect(bottomRight.y + bottomRight.height).toBe(3000);
  });

  it('keeps the requested ratio at any zoom', () => {
    const region = computeRegion(LANDSCAPE, 3 / 4, 2.5, { x: 2000, y: 1500 });

    expect(region.width / region.height).toBeCloseTo(3 / 4);
  });
});

describe('clampZoom', () => {
  it('stays between 1 and the maximum', () => {
    expect(clampZoom(0.2)).toBe(1);
    expect(clampZoom(2)).toBe(2);
    expect(clampZoom(99)).toBe(MAX_COVER_ZOOM);
  });
});

describe('panCenter', () => {
  it('moves the center opposite to the finger, scaled to source pixels', () => {
    expect(panCenter({ x: 2000, y: 1500 }, { x: 50, y: -20 }, 0.5)).toEqual({ x: 1900, y: 1540 });
  });
});

describe('computeFrameRegion', () => {
  it('shows a centered band of a square for a wide frame', () => {
    expect(computeFrameRegion({ x: 0, y: 0, width: 1000, height: 1000 }, 2)).toEqual({
      x: 0,
      y: 250,
      width: 1000,
      height: 500,
    });
  });

  it('shows a centered strip of a square for a portrait frame', () => {
    expect(computeFrameRegion({ x: 100, y: 100, width: 1000, height: 1000 }, 0.5)).toEqual({
      x: 350,
      y: 100,
      width: 500,
      height: 1000,
    });
  });
});

describe('regionToImageStyle', () => {
  it('scales and offsets the whole image so only the region is visible', () => {
    const style = regionToImageStyle(
      { x: 500, y: 0, width: 3000, height: 3000 },
      { width: 300, height: 300 },
      LANDSCAPE,
    );

    expect(style).toEqual({ width: 400, height: 300, left: -50, top: 0 });
  });
});

describe('toCropRect', () => {
  it('rounds the region to whole pixels', () => {
    expect(toCropRect({ x: 10.4, y: 20.6, width: 99.5, height: 50.2 }, LANDSCAPE)).toEqual({
      originX: 10,
      originY: 21,
      width: 100,
      height: 50,
    });
  });

  it('never exceeds the image', () => {
    expect(toCropRect({ x: 3990, y: 2995, width: 500, height: 500 }, LANDSCAPE)).toEqual({
      originX: 3990,
      originY: 2995,
      width: 10,
      height: 5,
    });
  });
});
