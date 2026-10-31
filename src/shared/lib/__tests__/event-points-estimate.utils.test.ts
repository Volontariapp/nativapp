import {
  MAX_SIMULATED_ATTENDEES,
  clearEventPointsEstimateCache,
  estimateEventPointsRange,
  extractPointsRange,
  isLegacyScoring,
} from '../event-points-estimate.utils';
import type { EventScoringCalculator } from '../event-points-estimate.utils';
import { createEmptyScoringResult, createScoringResult } from './event-scoring-result.factory';

const baseInput = {
  startAt: '2026-11-01T10:00:00.000Z',
  endAt: '2026-11-01T12:00:00.000Z',
  maxParticipants: 5,
  organizerId: 'organizer-1',
};

describe('event-points-estimate.utils', () => {
  let calculator: jest.MockedFunction<EventScoringCalculator>;

  beforeEach(() => {
    clearEventPointsEstimateCache();
    calculator = jest.fn<ReturnType<EventScoringCalculator>, Parameters<EventScoringCalculator>>();
    calculator.mockReturnValue(createScoringResult(263, 162));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('picks first and last rank values from a hand-written result', () => {
    expect(
      extractPointsRange({
        formulaVersion: 1,
        pool: 0,
        organizerPoints: 0,
        participants: [
          { userId: 'b', rank: 2, points: 200 },
          { userId: 'c', rank: 3, points: 150 },
          { userId: 'a', rank: 1, points: 300 },
        ],
      }),
    ).toEqual({ min: 150, max: 300 });
  });

  it('returns null for an empty result', () => {
    expect(extractPointsRange(createEmptyScoringResult())).toBeNull();
  });

  it('returns the range with N = maxParticipants synthetic attendees without the organizer', () => {
    expect(estimateEventPointsRange(baseInput, calculator)).toEqual({ min: 162, max: 263 });

    const params = calculator.mock.calls[0]?.[0];
    expect(params?.attendees).toHaveLength(5);
    expect(params?.attendees.map((a) => a.userId)).not.toContain('organizer-1');
    expect(new Set(params?.attendees.map((a) => a.userId)).size).toBe(5);
    expect(params?.maxParticipants).toBe(5);
    expect(params?.organizerId).toBe('organizer-1');
    const times = params?.attendees.map((a) => Number(a.registeredAt)) ?? [];
    expect(times).toEqual([...times].sort((a, b) => a - b));
  });

  it('returns null without usable capacity', () => {
    expect(estimateEventPointsRange({ ...baseInput, maxParticipants: 0 }, calculator)).toBeNull();
    expect(estimateEventPointsRange({ ...baseInput, maxParticipants: -2 }, calculator)).toBeNull();
    expect(calculator).not.toHaveBeenCalled();
  });

  it('returns null for invalid or inverted dates', () => {
    expect(estimateEventPointsRange({ ...baseInput, startAt: 'nope' }, calculator)).toBeNull();
    expect(estimateEventPointsRange({ ...baseInput, endAt: '' }, calculator)).toBeNull();
    expect(
      estimateEventPointsRange({ ...baseInput, endAt: baseInput.startAt }, calculator),
    ).toBeNull();
    expect(calculator).not.toHaveBeenCalled();
  });

  it('refuses to simulate very large capacities', () => {
    expect(
      estimateEventPointsRange(
        { ...baseInput, maxParticipants: MAX_SIMULATED_ATTENDEES + 1 },
        calculator,
      ),
    ).toBeNull();
    expect(calculator).not.toHaveBeenCalled();
  });

  it('memoizes by start, end and capacity', () => {
    estimateEventPointsRange(baseInput, calculator);
    estimateEventPointsRange({ ...baseInput }, calculator);
    expect(calculator).toHaveBeenCalledTimes(1);

    estimateEventPointsRange({ ...baseInput, maxParticipants: 6 }, calculator);
    expect(calculator).toHaveBeenCalledTimes(2);
  });

  it('returns null when the calculator yields no participant', () => {
    calculator.mockReturnValue(createEmptyScoringResult());
    expect(estimateEventPointsRange(baseInput, calculator)).toBeNull();
  });

  it('flags absent or sub-1 scoring versions as legacy', () => {
    expect(isLegacyScoring(undefined)).toBe(true);
    expect(isLegacyScoring(0)).toBe(true);
    expect(isLegacyScoring(1)).toBe(false);
  });
});
