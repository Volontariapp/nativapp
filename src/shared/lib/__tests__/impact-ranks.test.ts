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
      { name: 'FIELD VOLUNTEER', minPoints: 300 },
      { name: 'COMMUNITY RANGER', minPoints: 900 },
      { name: 'IMPACT WARRIOR', minPoints: 2100 },
      { name: 'CHANGE MAKER', minPoints: 4500 },
      { name: 'CLEANER MASTER', minPoints: 9000 },
      { name: 'HOPE GUARDIAN', minPoints: 16500 },
      { name: 'WORLD DEFENDER', minPoints: 27000 },
      { name: 'LIVING LEGEND', minPoints: 45000 },
      { name: 'ATLAS TITAN', minPoints: 75000 },
    ]);
  });

  it('gives every rank a tagline', () => {
    expect(IMPACT_RANKS.every((rank) => rank.tagline.trim() !== '')).toBe(true);
  });
});

describe('getImpactRankStatus', () => {
  const cases = [
    { points: 0, current: 'ROOKIE HELPER', next: 'FIELD VOLUNTEER', pointsToNext: 300, ratio: 0 },
    {
      points: 150,
      current: 'ROOKIE HELPER',
      next: 'FIELD VOLUNTEER',
      pointsToNext: 150,
      ratio: 0.5,
    },
    {
      points: 300,
      current: 'FIELD VOLUNTEER',
      next: 'COMMUNITY RANGER',
      pointsToNext: 600,
      ratio: 0,
    },
    {
      points: 600,
      current: 'FIELD VOLUNTEER',
      next: 'COMMUNITY RANGER',
      pointsToNext: 300,
      ratio: 0.5,
    },
    {
      points: 899,
      current: 'FIELD VOLUNTEER',
      next: 'COMMUNITY RANGER',
      pointsToNext: 1,
      ratio: 599 / 600,
    },
    {
      points: 900,
      current: 'COMMUNITY RANGER',
      next: 'IMPACT WARRIOR',
      pointsToNext: 1200,
      ratio: 0,
    },
    {
      points: 9000,
      current: 'CLEANER MASTER',
      next: 'HOPE GUARDIAN',
      pointsToNext: 7500,
      ratio: 0,
    },
    {
      points: 74999,
      current: 'LIVING LEGEND',
      next: 'ATLAS TITAN',
      pointsToNext: 1,
      ratio: 29999 / 30000,
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

  it.each([75000, 75001, 99999])('with %i points, the highest rank is reached', (points) => {
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
