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
      { name: 'ROOKIE CLEANER', minPoints: 0 },
      { name: 'STREET SWEEPER', minPoints: 100 },
      { name: 'GREEN RANGER', minPoints: 300 },
      { name: 'ECO WARRIOR', minPoints: 700 },
      { name: 'EARTH GUARDIAN', minPoints: 1500 },
      { name: 'CLEANER MASTER', minPoints: 3000 },
      { name: 'NATURE SENTINEL', minPoints: 5500 },
      { name: 'PLANET DEFENDER', minPoints: 9000 },
      { name: 'ECO LEGEND', minPoints: 15000 },
      { name: 'GAIA TITAN', minPoints: 25000 },
    ]);
  });

  it('gives every rank a tagline', () => {
    expect(IMPACT_RANKS.every((rank) => rank.tagline.trim() !== '')).toBe(true);
  });
});

describe('getImpactRankStatus', () => {
  const cases = [
    { points: 0, current: 'ROOKIE CLEANER', next: 'STREET SWEEPER', pointsToNext: 100, ratio: 0 },
    { points: 50, current: 'ROOKIE CLEANER', next: 'STREET SWEEPER', pointsToNext: 50, ratio: 0.5 },
    { points: 100, current: 'STREET SWEEPER', next: 'GREEN RANGER', pointsToNext: 200, ratio: 0 },
    { points: 200, current: 'STREET SWEEPER', next: 'GREEN RANGER', pointsToNext: 100, ratio: 0.5 },
    { points: 299, current: 'STREET SWEEPER', next: 'GREEN RANGER', pointsToNext: 1, ratio: 0.995 },
    { points: 300, current: 'GREEN RANGER', next: 'ECO WARRIOR', pointsToNext: 400, ratio: 0 },
    {
      points: 3000,
      current: 'CLEANER MASTER',
      next: 'NATURE SENTINEL',
      pointsToNext: 2500,
      ratio: 0,
    },
    { points: 24999, current: 'ECO LEGEND', next: 'GAIA TITAN', pointsToNext: 1, ratio: 0.9999 },
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

    expect(status.current.name).toBe('GAIA TITAN');
    expect(status.next).toBeNull();
    expect(status.pointsToNext).toBe(0);
    expect(status.ratio).toBe(1);
    expect(status.isMax).toBe(true);
  });

  it.each([-5, Number.NaN])('treats the invalid score %p as zero', (points) => {
    const status = getImpactRankStatus(points);

    expect(status.points).toBe(0);
    expect(status.current.name).toBe('ROOKIE CLEANER');
  });
});
