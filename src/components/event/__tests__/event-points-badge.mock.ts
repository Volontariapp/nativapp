import { computeEventScoring } from '@volontariapp/shared';
import { createScoringResult } from '@/shared/lib/__tests__/event-scoring-result.factory';

export const mockedComputeEventScoring = jest.mocked(computeEventScoring);

/** Calculateur deterministe : 263 pour le premier rang, 162 pour le dernier. */
export const useDeterministicScoring = (): void => {
  mockedComputeEventScoring.mockReturnValue(createScoringResult(263, 162));
};
