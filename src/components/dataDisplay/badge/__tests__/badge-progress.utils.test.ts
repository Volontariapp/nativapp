import { describeRequirement, formatPoints } from '../badge-progress.utils';

describe('describeRequirement', () => {
  it('says how far the user is and what is being counted', () => {
    expect(describeRequirement({ metric: 'SOCIAL_LIKES_GIVEN', current: 9, target: 10 })).toBe(
      '9 / 10 posts aimés',
    );
    expect(describeRequirement({ metric: 'EVENTS_FINISHED_ECOLOGY', current: 0, target: 5 })).toBe(
      '0 / 5 événements éco terminés',
    );
  });

  it('keeps the technical name of a metric it does not know', () => {
    expect(describeRequirement({ metric: 'SOMETHING_NEW', current: 1, target: 2 })).toBe(
      '1 / 2 SOMETHING_NEW',
    );
  });
});

describe('formatPoints', () => {
  it('prefixes the points with a plus sign', () => {
    expect(formatPoints(250)).toBe('+250 pts');
    expect(formatPoints(1000)).toBe('+1000 pts');
  });
});
