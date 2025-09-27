/**
 * Utility functions for text normalization, particularly for handling accented characters
 * in French text while preserving the original for display purposes.
 */

/**
 * Normalizes accented characters to their base form (é → e, à → a, etc.)
 * Used for game logic comparisons while preserving original text for display.
 * 
 * @param text The text to normalize
 * @returns Normalized text without accents
 */
export function normalizeAccents(text: string): string {
  return text
    .normalize('NFD') // Decompose characters into base + combining marks
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase() // Consistent casing for comparisons
}

/**
 * Normalizes text for word comparison in game logic.
 * Removes accents and converts to uppercase for consistency.
 * 
 * @param text The text to normalize for comparison
 * @returns Normalized text for game logic
 */
export function normalizeForComparison(text: string): string {
  return normalizeAccents(text).toUpperCase()
}

/**
 * Checks if two words are equivalent when ignoring accents and case.
 * 
 * @param word1 First word to compare
 * @param word2 Second word to compare
 * @returns True if words are equivalent when normalized
 */
export function wordsAreEquivalent(word1: string, word2: string): boolean {
  return normalizeForComparison(word1) === normalizeForComparison(word2)
}

/**
 * For French language processing - common accent mappings
 */
export const FRENCH_ACCENT_MAP = {
  'à': 'a', 'á': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a', 'å': 'a',
  'è': 'e', 'é': 'e', 'ê': 'e', 'ë': 'e',
  'ì': 'i', 'í': 'i', 'î': 'i', 'ï': 'i',
  'ò': 'o', 'ó': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
  'ù': 'u', 'ú': 'u', 'û': 'u', 'ü': 'u',
  'ý': 'y', 'ÿ': 'y',
  'ñ': 'n',
  'ç': 'c'
} as const

/**
 * Alternative normalization using explicit mapping (fallback if NFD doesn't work)
 * 
 * @param text The text to normalize
 * @returns Normalized text
 */
export function normalizeAccentsAlternative(text: string): string {
  let normalized = text.toLowerCase()
  
  for (const [accented, base] of Object.entries(FRENCH_ACCENT_MAP)) {
    normalized = normalized.replace(new RegExp(accented, 'g'), base)
  }
  
  return normalized
}