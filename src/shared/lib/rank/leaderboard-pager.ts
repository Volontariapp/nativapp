/**
 * Pagination du classement par pages numérotées. Le serveur ne donne qu'un curseur « page
 * suivante » : on garde la pile des curseurs déjà parcourus pour pouvoir revenir en arrière.
 * `undefined` est le curseur de la première page.
 */
export interface LeaderboardPagerState {
  readonly cursors: readonly (string | undefined)[];
}

export const INITIAL_LEADERBOARD_PAGER: LeaderboardPagerState = { cursors: [undefined] };

/** Curseur de la page affichée. */
export const pagerCursor = (state: LeaderboardPagerState): string | undefined =>
  state.cursors.at(-1);

/** Numéro de la page affichée, à partir de 1. */
export const pagerPageNumber = (state: LeaderboardPagerState): number => state.cursors.length;

export const pagerHasPrevious = (state: LeaderboardPagerState): boolean => state.cursors.length > 1;

/** Passe à la page suivante ; sans curseur suivant, on reste sur place. */
export const pagerNext = (
  state: LeaderboardPagerState,
  nextCursor: string | undefined,
): LeaderboardPagerState =>
  nextCursor === undefined ? state : { cursors: [...state.cursors, nextCursor] };

/** Revient à la page précédente ; sur la première page, on reste sur place. */
export const pagerPrevious = (state: LeaderboardPagerState): LeaderboardPagerState =>
  pagerHasPrevious(state) ? { cursors: state.cursors.slice(0, -1) } : state;
