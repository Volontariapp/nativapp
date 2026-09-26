import { BADGE_REGISTRY, BADGE_VARIANTS } from './badge.config';
import type { BadgeVariant } from './badge.types';

function normalizeString(val: string): string {
  return val
    .trim()
    .toUpperCase()
    .replace(/[-\s]/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Resolves any badge representation (string technical name, slug, object with slug/id/name)
 * into a typed BadgeVariant.
 */
export function resolveBadgeVariant(item: unknown): BadgeVariant | null {
  if (item == null) {
    return null;
  }

  // Case 1: item is a string (e.g. "EVENT_PARTICIPATION_TIER_1")
  if (typeof item === 'string') {
    const directMatch = item.trim().toUpperCase() as BadgeVariant;
    if (BADGE_VARIANTS.includes(directMatch)) {
      return directMatch;
    }

    const normalized = normalizeString(item);
    for (const variant of BADGE_VARIANTS) {
      if (normalizeString(variant) === normalized) {
        return variant;
      }
      if (normalizeString(BADGE_REGISTRY[variant].name) === normalized) {
        return variant;
      }
    }
    return null;
  }

  // Case 2: item is an object (e.g. BadgeWeb with slug, id, variant, name)
  if (typeof item === 'object') {
    const candidate = item as {
      slug?: unknown;
      variant?: unknown;
      code?: unknown;
      id?: unknown;
      name?: unknown;
    };

    const stringFields = [
      candidate.slug,
      candidate.variant,
      candidate.code,
      candidate.id,
    ].filter((val): val is string => typeof val === 'string');

    for (const field of stringFields) {
      const resolved = resolveBadgeVariant(field);
      if (resolved != null) {
        return resolved;
      }
    }

    if (typeof candidate.name === 'string') {
      const resolved = resolveBadgeVariant(candidate.name);
      if (resolved != null) {
        return resolved;
      }
    }
  }

  return null;
}
