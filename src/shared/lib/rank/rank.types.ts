import type { LeaderboardScopeWeb } from '@volontariapp/contracts';

/** Place sur le podium d'un classement : 1er, 2e ou 3e. */
export type RankTier = 1 | 2 | 3;

/** Distinction d'un utilisateur sur un classement (global, mois ou semaine). */
export interface RankDistinction {
  readonly scope: LeaderboardScopeWeb;
  readonly tier: RankTier;
}

/** Poids visuel du cadre : fort (profil), moyen (post, organisateur), fin (commentaire, liste). */
export type RankFrameIntensity = 'strong' | 'medium' | 'thin';

/** Forme du visuel : couronne, médaille, gemme ou flamme, selon le thème du classement. */
export type RankIconKind = 'crown' | 'medal' | 'gem' | 'flame';
