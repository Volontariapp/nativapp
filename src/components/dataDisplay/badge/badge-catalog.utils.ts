import type { BadgeWeb } from '@volontariapp/contracts';
import { BADGE_REGISTRY, BADGE_VARIANTS } from './badge.config';
import { resolveBadgeVariant } from './badge-resolver.utils';
import type { BadgeCatalog, BadgeCatalogEntry, BadgeCatalogSection } from './badge-catalog.types';
import type { BadgeCategory, BadgeVariant } from './badge.types';

const toUnlockedVariants = (owned: readonly (BadgeWeb | string)[]): Set<BadgeVariant> => {
  const variants = new Set<BadgeVariant>();
  owned.forEach((item) => {
    const variant = resolveBadgeVariant(item);
    if (variant !== null) variants.add(variant);
  });
  return variants;
};

/** Unlocked badges first, each group keeping the order of the catalog. */
const byUnlockedFirst = (left: BadgeCatalogEntry, right: BadgeCatalogEntry): number =>
  Number(right.unlocked) - Number(left.unlocked);

/**
 * Catalogue complet des badges, découpé par catégorie, avec ce que l'utilisateur possède déjà.
 * Les badges inconnus du catalogue sont ignorés et un badge n'est compté qu'une fois.
 */
export const buildBadgeCatalog = (owned: readonly (BadgeWeb | string)[]): BadgeCatalog => {
  const unlocked = toUnlockedVariants(owned);
  const sectionsByCategory = new Map<BadgeCategory, BadgeCatalogSection>();

  BADGE_VARIANTS.forEach((variant) => {
    const definition = BADGE_REGISTRY[variant];
    const section = sectionsByCategory.get(definition.category) ?? {
      category: definition.category,
      title: definition.categoryLabel,
      data: [],
    };
    section.data.push({ variant, definition, unlocked: unlocked.has(variant) });
    sectionsByCategory.set(definition.category, section);
  });

  const sections = [...sectionsByCategory.values()].map((section) => ({
    ...section,
    data: [...section.data].sort(byUnlockedFirst),
  }));

  return { total: BADGE_VARIANTS.length, unlockedCount: unlocked.size, sections };
};
