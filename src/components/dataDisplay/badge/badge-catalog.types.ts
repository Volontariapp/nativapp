import type { BadgeProgressWeb } from '@volontariapp/contracts';
import type { BadgeCategory, BadgeDefinition, BadgeVariant } from './badge.types';

export interface BadgeCatalogEntry {
  variant: BadgeVariant;
  definition: BadgeDefinition;
  unlocked: boolean;
  /** Avancement renvoyé par le serveur ; absent tant qu'il n'est pas chargé. */
  progress?: BadgeProgressWeb;
}

export interface BadgeCatalogSection {
  category: BadgeCategory;
  title: string;
  data: BadgeCatalogEntry[];
}

export interface BadgeCatalog {
  total: number;
  unlockedCount: number;
  /** Points des badges obtenus ; 0 tant que la progression n'est pas chargée. */
  earnedPoints: number;
  sections: BadgeCatalogSection[];
}
