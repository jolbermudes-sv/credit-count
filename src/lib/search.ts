// src/lib/search.ts

/**
 * Strips PostgREST filter-syntax delimiters (this string typically gets
 * interpolated into a raw `.or()` filter expression, so a stray comma or
 * paren could otherwise reshape the query) and escapes SQL LIKE wildcards,
 * so a search for e.g. "50%" behaves as a literal match rather than an
 * open wildcard.
 */
export function sanitizeSearchTerm(input: string): string {
  return input
    .replace(/[,()]/g, '')
    .replace(/[%_]/g, '\\$&')
    .trim()
}

export const MIN_SEARCH_QUERY_LENGTH = 2