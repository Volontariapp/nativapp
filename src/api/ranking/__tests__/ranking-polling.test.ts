import { fallbackRefetchInterval } from '../ranking-polling';

const SECOND = 1000;
const START = 1_700_000_000_000;

const fallbackQuery = () => ({ state: { data: { pages: [{ isFallback: true }] } } });
const rankedQuery = () => ({ state: { data: { pages: [{ isFallback: false }] } } });
const emptyQuery = () => ({ state: { data: undefined } });

describe('fallbackRefetchInterval', () => {
  it('does not poll when the list is ready', () => {
    expect(fallbackRefetchInterval(rankedQuery(), START)).toBe(false);
  });

  it('does not poll before the first response', () => {
    expect(fallbackRefetchInterval(emptyQuery(), START)).toBe(false);
  });

  it('polls every 2 seconds right after the list turned out not to be ready', () => {
    expect(fallbackRefetchInterval(fallbackQuery(), START)).toBe(2 * SECOND);
  });

  it('backs off while the list stays unavailable', () => {
    const query = fallbackQuery();

    fallbackRefetchInterval(query, START);

    expect(fallbackRefetchInterval(query, START + 10 * SECOND)).toBe(4 * SECOND);
    expect(fallbackRefetchInterval(query, START + 30 * SECOND)).toBe(8 * SECOND);
    expect(fallbackRefetchInterval(query, START + 90 * SECOND)).toBe(15 * SECOND);
  });

  it('gives up after 5 minutes', () => {
    const query = fallbackQuery();

    fallbackRefetchInterval(query, START);

    expect(fallbackRefetchInterval(query, START + 300 * SECOND)).toBe(false);
  });

  it('is stable when asked several times at the same instant', () => {
    const query = fallbackQuery();

    expect(fallbackRefetchInterval(query, START)).toBe(2 * SECOND);
    expect(fallbackRefetchInterval(query, START)).toBe(2 * SECOND);
  });

  it('restarts from the fast pace when the list falls back again after being ready', () => {
    const fallback = { state: { data: { pages: [{ isFallback: true }] } } };

    fallbackRefetchInterval(fallback, START);
    fallbackRefetchInterval(fallback, START + 200 * SECOND);
    fallback.state.data = { pages: [{ isFallback: false }] };
    fallbackRefetchInterval(fallback, START + 210 * SECOND);
    fallback.state.data = { pages: [{ isFallback: true }] };

    expect(fallbackRefetchInterval(fallback, START + 220 * SECOND)).toBe(2 * SECOND);
  });
});
