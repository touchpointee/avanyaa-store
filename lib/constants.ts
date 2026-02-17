/**
 * Sizes considered "Big Size" / Plus Size for dedicated section and filtering.
 * Products that have at least one of these sizes will appear in the Big Size section.
 */
export const BIG_SIZES = ['XL', 'XXL', '2XL', '3XL', '4XL'] as const;

export type BigSize = (typeof BIG_SIZES)[number];

export function isBigSize(size: string): boolean {
  return BIG_SIZES.includes(size.toUpperCase() as BigSize);
}
