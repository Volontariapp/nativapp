import { formatRankTier } from '../format-rank-tier';

describe('formatRankTier', () => {
  it('shows the exact rank for the first 100', () => {
    expect(formatRankTier(1)).toBe('N° 1');
    expect(formatRankTier(12)).toBe('N° 12');
    expect(formatRankTier(100)).toBe('N° 100');
  });

  it('shows a tier beyond the 100th place', () => {
    expect(formatRankTier(101)).toBe('Top 500');
    expect(formatRankTier(500)).toBe('Top 500');
    expect(formatRankTier(501)).toBe('Top 1 000');
    expect(formatRankTier(1000)).toBe('Top 1 000');
    expect(formatRankTier(4999)).toBe('Top 5 000');
    expect(formatRankTier(5001)).toBe('Top 10 000');
  });

  it('falls back to a plain label beyond the last tier', () => {
    expect(formatRankTier(10001)).toBe('Classé');
  });
});
