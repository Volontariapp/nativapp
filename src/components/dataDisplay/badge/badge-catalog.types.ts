import type { BadgeCategory, BadgeDefinition, BadgeVariant } from './badge.types';

export interface BadgeCatalogEntry {
  variant: BadgeVariant;
  definition: BadgeDefinition;
  unlocked: boolean;
}

export interface BadgeCatalogSection {
  category: BadgeCategory;
  title: string;
  data: BadgeCatalogEntry[];
}

export interface BadgeCatalog {
  total: number;
  unlockedCount: number;
  sections: BadgeCatalogSection[];
}
