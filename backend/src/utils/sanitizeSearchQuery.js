/**
 * Sanitizes search queries to prevent NoSQL injection attacks.
 * Escapes regex metacharacters and special operators that could be
 * interpreted as MongoDB operators rather than literal search terms.
 *
 * @param {string} query - The raw search query string
 * @returns {string} The sanitized search query safe for MongoDB text search
 */
export const sanitizeSearchQuery = (query) => {
  if (typeof query !== 'string') {
    return '';
  }

  // Escape regex metacharacters to treat them as literals
  return query
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .trim();
};
