import {
  formatRankingScore,
  formatExactScore,
  getRankingReasonLabel,
  getRankingReasonExplanation,
  RANKING_REASON_LABELS,
  RANKING_REASON_EXPLANATIONS,
  RANKING_FORMULA_DETAILS,
} from '../ranking-reasons.utils';
import type { RankingReasonWeb } from '@volontariapp/contracts';

describe('ranking-reasons.utils', () => {
  describe('formatRankingScore', () => {
    it('formats numbers with minimum 1 decimal', () => {
      expect(formatRankingScore(78.4)).toBe('78.4');
      expect(formatRankingScore(88.5)).toBe('88.5');
      expect(formatRankingScore(12)).toBe('12.0');
      expect(formatRankingScore(0)).toBe('0.0');
    });

    it('formats precise floating scores with up to 4 decimals without truncation to 0.1', () => {
      expect(formatRankingScore(0.642517)).toBe('0.6425');
      expect(formatRankingScore(0.123)).toBe('0.123');
      expect(formatRankingScore(0.0042)).toBe('0.0042');
      expect(formatRankingScore(0.9999)).toBe('0.9999');
    });

    it('handles custom maxDecimals', () => {
      expect(formatRankingScore(0.1234567, 2)).toBe('0.12');
      expect(formatRankingScore(0.1234567, 6)).toBe('0.123457');
    });

    it('handles non-number or NaN gracefully', () => {
      expect(formatRankingScore(NaN)).toBe('0.0');
      expect(formatRankingScore(undefined as unknown as number)).toBe('0.0');
      expect(formatRankingScore(null as unknown as number)).toBe('0.0');
    });
  });

  describe('formatExactScore', () => {
    it('returns the exact unrounded floating score as string', () => {
      expect(formatExactScore(0.642517823901)).toBe('0.642517823901');
      expect(formatExactScore(78.4)).toBe('78.4');
      expect(formatExactScore(0)).toBe('0');
    });

    it('handles invalid numbers', () => {
      expect(formatExactScore(NaN)).toBe('0');
      expect(formatExactScore(undefined as unknown as number)).toBe('0');
    });
  });

  describe('getRankingReasonLabel', () => {
    it('returns proper labels for all defined RankingReasonWeb codes', () => {
      const keys = Object.keys(RANKING_REASON_LABELS) as RankingReasonWeb[];
      expect(keys.length).toBeGreaterThan(0);

      for (const reason of keys) {
        const label = getRankingReasonLabel(reason);
        expect(label).toBeTruthy();
        expect(typeof label).toBe('string');
      }
    });

    it('returns expected French translation for specific reasons', () => {
      expect(getRankingReasonLabel('NEAR_YOU')).toBe('Proche de vous');
      expect(getRankingReasonLabel('FOLLOWED_AUTHOR')).toBe('Organisateur suivi');
      expect(getRankingReasonLabel('FRIEND_AUTHOR')).toBe('Organisé par un ami');
      expect(getRankingReasonLabel('RECENT')).toBe('Nouveau');
      expect(getRankingReasonLabel('LINKED_EVENT_WISHED')).toBe('Événement lié souhaité');
      expect(getRankingReasonLabel('LINKED_EVENT_JOINED')).toBe('Événement lié rejoint');
    });
  });

  describe('getRankingReasonExplanation', () => {
    it('returns detailed explanation and formula for every reason', () => {
      const keys = Object.keys(RANKING_REASON_EXPLANATIONS) as RankingReasonWeb[];
      expect(keys.length).toBe(11);

      for (const reason of keys) {
        const explanation = getRankingReasonExplanation(reason);
        expect(explanation).toBeDefined();
        expect(explanation?.shortDescription).toBeTruthy();
        expect(explanation?.detailedFormula).toBeTruthy();
        expect(explanation?.category).toBeTruthy();
      }
    });
  });

  describe('RANKING_FORMULA_DETAILS', () => {
    it('defines accurate weights and penalties for feed and events', () => {
      expect(RANKING_FORMULA_DETAILS.feed.weights.length).toBe(3);
      expect(RANKING_FORMULA_DETAILS.feed.penalties.length).toBe(1);
      expect(RANKING_FORMULA_DETAILS.feed.penalties[0]?.penalty).toBe('× 0.6');

      expect(RANKING_FORMULA_DETAILS.events.weights.length).toBe(5);
      const proximity = RANKING_FORMULA_DETAILS.events.weights.find((w) =>
        w.name.includes('Proximité'),
      );
      expect(proximity?.weight).toBe('27%');
    });
  });
});
