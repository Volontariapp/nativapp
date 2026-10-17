import { IMPACT_RANKS, formatPoints, getImpactRankStatus } from '../impact-ranks';

describe('formatPoints', () => {
  it.each([
    { points: 0, text: '0' },
    { points: 999, text: '999' },
    { points: 1250, text: '1 250' },
    { points: 25000, text: '25 000' },
    { points: 1234567, text: '1 234 567' },
  ])('writes $points as "$text" with a plain space between thousands', ({ points, text }) => {
    expect(formatPoints(points)).toBe(text);
  });
});

describe('IMPACT_RANKS', () => {
  it('lists the ten ranks in ascending order of points, starting at zero', () => {
    expect(IMPACT_RANKS.map(({ name, minPoints }) => ({ name, minPoints }))).toEqual([
      { name: 'ROOKIE HELPER', minPoints: 0 },
      { name: 'FIELD VOLUNTEER', minPoints: 100 },
      { name: 'COMMUNITY RANGER', minPoints: 300 },
      { name: 'IMPACT WARRIOR', minPoints: 700 },
      { name: 'CHANGE MAKER', minPoints: 1500 },
      { name: 'IMPACT MASTER', minPoints: 3000 },
      { name: 'HOPE GUARDIAN', minPoints: 5500 },
      { name: 'WORLD DEFENDER', minPoints: 9000 },
      { name: 'LIVING LEGEND', minPoints: 15000 },
      { name: 'ATLAS TITAN', minPoints: 25000 },
    ]);
  });

  it('gives every rank a tagline', () => {
    expect(IMPACT_RANKS.every((rank) => rank.tagline.trim() !== '')).toBe(true);
  });
});

describe('getImpactRankStatus', () => {
  const cases = [
    { points: 0, current: 'ROOKIE HELPER', next: 'FIELD VOLUNTEER', pointsToNext: 100, ratio: 0 },
    { points: 50, current: 'ROOKIE HELPER', next: 'FIELD VOLUNTEER', pointsToNext: 50, ratio: 0.5 },
    {
      points: 100,
      current: 'FIELD VOLUNTEER',
      next: 'COMMUNITY RANGER',
      pointsToNext: 200,
      ratio: 0,
    },
    {
      points: 200,
      current: 'FIELD VOLUNTEER',
      next: 'COMMUNITY RANGER',
      pointsToNext: 100,
      ratio: 0.5,
    },
    {
      points: 299,
      current: 'FIELD VOLUNTEER',
      next: 'COMMUNITY RANGER',
      pointsToNext: 1,
      ratio: 0.995,
    },
    {
      points: 300,
      current: 'COMMUNITY RANGER',
      next: 'IMPACT WARRIOR',
      pointsToNext: 400,
      ratio: 0,
    },
    {
      points: 3000,
      current: 'IMPACT MASTER',
      next: 'HOPE GUARDIAN',
      pointsToNext: 2500,
      ratio: 0,
    },
    {
      points: 24999,
      current: 'LIVING LEGEND',
      next: 'ATLAS TITAN',
      pointsToNext: 1,
      ratio: 0.9999,
    },
  ];

  it.each(cases)(
    'with $points points, the rank is $current and $pointsToNext points remain before $next',
    ({ points, current, next, pointsToNext, ratio }) => {
      const status = getImpactRankStatus(points);

      expect(status.current.name).toBe(current);
      expect(status.next?.name).toBe(next);
      expect(status.pointsToNext).toBe(pointsToNext);
      expect(status.ratio).toBeCloseTo(ratio, 5);
      expect(status.isMax).toBe(false);
      expect(status.points).toBe(points);
    },
  );

  it.each([25000, 25001, 99999])('with %i points, the highest rank is reached', (points) => {
    const status = getImpactRankStatus(points);

    expect(status.current.name).toBe('ATLAS TITAN');
    expect(status.next).toBeNull();
    expect(status.pointsToNext).toBe(0);
    expect(status.ratio).toBe(1);
    expect(status.isMax).toBe(true);
  });

  it.each([-5, Number.NaN])('treats the invalid score %p as zero', (points) => {
    const status = getImpactRankStatus(points);

    expect(status.points).toBe(0);
    expect(status.current.name).toBe('ROOKIE HELPER');
  });
});
