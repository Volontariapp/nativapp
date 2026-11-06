import type { BadgeProgressWeb, BadgeWeb } from '@volontariapp/contracts';
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

const toProgressByVariant = (
  progress: readonly BadgeProgressWeb[],
): Map<BadgeVariant, BadgeProgressWeb> => {
  const byVariant = new Map<BadgeVariant, BadgeProgressWeb>();
  progress.forEach((item) => {
    const variant = resolveBadgeVariant(item.slug);
    if (variant !== null) byVariant.set(variant, item);
  });
  return byVariant;
};

const percentOf = (entry: BadgeCatalogEntry): number => entry.progress?.percent ?? 0;

/**
 * Unlocked badges first, then the closest to unlocking. Without progress every locked badge is at 0,
 * so each group keeps the order of the catalog (the sort is stable).
 */
const byUnlockedThenProgress = (left: BadgeCatalogEntry, right: BadgeCatalogEntry): number =>
  Number(right.unlocked) - Number(left.unlocked) || percentOf(right) - percentOf(left);

/**
 * Catalogue complet des badges, découpé par catégorie, avec ce que l'utilisateur possède déjà.
 * Les badges inconnus du catalogue sont ignorés et un badge n'est compté qu'une fois. La progression
 * est facultative : un badge est obtenu s'il figure sur le profil ou si le serveur le dit débloqué.
 */
export const buildBadgeCatalog = (
  owned: readonly (BadgeWeb | string)[],
  progress: readonly BadgeProgressWeb[] = [],
): BadgeCatalog => {
  const progressByVariant = toProgressByVariant(progress);
  const unlocked = toUnlockedVariants(owned);
  progressByVariant.forEach((item, variant) => {
    if (item.unlocked) unlocked.add(variant);
  });
  const sectionsByCategory = new Map<BadgeCategory, BadgeCatalogSection>();

  BADGE_VARIANTS.forEach((variant) => {
    const definition = BADGE_REGISTRY[variant];
    const section = sectionsByCategory.get(definition.category) ?? {
      category: definition.category,
      title: definition.categoryLabel,
      data: [],
    };
    const entryProgress = progressByVariant.get(variant);
    section.data.push({
      variant,
      definition,
      unlocked: unlocked.has(variant),
      ...(entryProgress !== undefined ? { progress: entryProgress } : {}),
    });
    sectionsByCategory.set(definition.category, section);
  });

  const sections = [...sectionsByCategory.values()].map((section) => ({
    ...section,
    data: [...section.data].sort(byUnlockedThenProgress),
  }));

  const earnedPoints = sections
    .flatMap((section) => section.data)
    .reduce((sum, entry) => sum + (entry.unlocked ? (entry.progress?.points ?? 0) : 0), 0);

  return { total: BADGE_VARIANTS.length, unlockedCount: unlocked.size, earnedPoints, sections };
};
