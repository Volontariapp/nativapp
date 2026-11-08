import {
  INITIAL_LEADERBOARD_PAGER,
  pagerCursor,
  pagerHasPrevious,
  pagerNext,
  pagerPageNumber,
  pagerPrevious,
} from '../leaderboard-pager';

describe('leaderboard pager', () => {
  it('starts on the first page, without a cursor and without a previous page', () => {
    expect(pagerPageNumber(INITIAL_LEADERBOARD_PAGER)).toBe(1);
    expect(pagerCursor(INITIAL_LEADERBOARD_PAGER)).toBeUndefined();
    expect(pagerHasPrevious(INITIAL_LEADERBOARD_PAGER)).toBe(false);
  });

  it('moves to the next page with the cursor given by the server', () => {
    const second = pagerNext(INITIAL_LEADERBOARD_PAGER, 'c2');

    expect(pagerPageNumber(second)).toBe(2);
    expect(pagerCursor(second)).toBe('c2');
    expect(pagerHasPrevious(second)).toBe(true);
  });

  it('stays on the last page when the server gives no next cursor', () => {
    const second = pagerNext(INITIAL_LEADERBOARD_PAGER, 'c2');

    expect(pagerNext(second, undefined)).toBe(second);
  });

  it('goes back through the pages already visited', () => {
    const third = pagerNext(pagerNext(INITIAL_LEADERBOARD_PAGER, 'c2'), 'c3');
    const second = pagerPrevious(third);

    expect(pagerPageNumber(second)).toBe(2);
    expect(pagerCursor(second)).toBe('c2');
    expect(pagerCursor(pagerPrevious(second))).toBeUndefined();
  });

  it('stays on the first page when going back from it', () => {
    expect(pagerPrevious(INITIAL_LEADERBOARD_PAGER)).toBe(INITIAL_LEADERBOARD_PAGER);
  });
});
