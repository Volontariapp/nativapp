import { getParticipationProgress } from '../impact-progress.utils';

describe('getParticipationProgress', () => {
  const cases = [
    {
      finishedCount: 0,
      tier: 'EVENT_PARTICIPATION_TIER_1',
      name: 'Premier Pas',
      threshold: 1,
      remaining: 1,
      ratio: 0,
    },
    {
      finishedCount: 1,
      tier: 'EVENT_PARTICIPATION_TIER_2',
      name: 'Engagé·e',
      threshold: 5,
      remaining: 4,
      ratio: 0.2,
    },
    {
      finishedCount: 4,
      tier: 'EVENT_PARTICIPATION_TIER_2',
      name: 'Engagé·e',
      threshold: 5,
      remaining: 1,
      ratio: 0.8,
    },
    {
      finishedCount: 5,
      tier: 'EVENT_PARTICIPATION_TIER_3',
      name: 'Pilier',
      threshold: 10,
      remaining: 5,
      ratio: 0.5,
    },
    {
      finishedCount: 10,
      tier: 'EVENT_PARTICIPATION_TIER_4',
      name: 'Figure locale',
      threshold: 20,
      remaining: 10,
      ratio: 0.5,
    },
    {
      finishedCount: 19,
      tier: 'EVENT_PARTICIPATION_TIER_4',
      name: 'Figure locale',
      threshold: 20,
      remaining: 1,
      ratio: 0.95,
    },
  ];

  it.each(cases)(
    'with $finishedCount finished events, targets $tier with $remaining remaining',
    ({ finishedCount, tier, name, threshold, remaining, ratio }) => {
      expect(getParticipationProgress(finishedCount)).toEqual({
        allTiersReached: false,
        nextTier: { variant: tier, name, threshold },
        remaining,
        ratio,
      });
    },
  );

  it.each([20, 21, 57])('with %i finished events, every tier is reached', (finishedCount) => {
    expect(getParticipationProgress(finishedCount)).toEqual({
      allTiersReached: true,
      nextTier: null,
      remaining: 0,
      ratio: 1,
    });
  });

  it.each([-3, Number.NaN])('treats the invalid count %p as zero', (finishedCount) => {
    expect(getParticipationProgress(finishedCount).nextTier?.threshold).toBe(1);
  });
});
