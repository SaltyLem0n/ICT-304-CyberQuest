/**
 * smart-search.js
 * Universal Object-Oriented Table & Collection Filtering Utility
 * Supports multi-token search, case-insensitivity, and robust type coercion.
 * Complies with RSU 360 X Development Rules.
 */
class SmartSearch {
  /**
   * Filter an array of items using multiple search tokens.
   * @param {string|number} query Search query string or number
   * @param {Array} items Array of items to filter
   * @param {Function} [getText] Optional accessor to extract string from item
   * @returns {Array} Filtered items where all search terms match
   */
  static filter(query, items, getText) {
    if (!Array.isArray(items)) return [];
    const queryStr = String(query ?? "").trim().toUpperCase();
    if (!queryStr) return items;
    const terms = queryStr.split(/\s+/).filter(Boolean);
    return items.filter(item => {
      const text = (getText ? String(getText(item) ?? "") : String(item ?? "")).toUpperCase();
      return terms.every(term => text.includes(term));
    });
  }

  /**
   * Filter DOM table rows in-place based on search query.
   * @param {string|number} query Search query string or number
   * @param {string} rowSelector CSS selector for table rows (e.g. '.caesar-shift-row', '.ascii-row')
   * @param {Function} [getText] Optional accessor to extract search text from row element
   */
  static filterTableRows(query, rowSelector, getText) {
    const queryStr = String(query ?? "").trim().toUpperCase();
    const terms = queryStr.split(/\s+/).filter(Boolean);
    if (typeof document === 'undefined') return;
    const rows = document.querySelectorAll(rowSelector);
    rows.forEach(r => {
      if (terms.length === 0) {
        r.style.display = '';
      } else {
        const text = (getText ? String(getText(r) ?? "") : String(r.textContent || "")).toUpperCase();
        const matches = terms.every(t => text.includes(t));
        r.style.display = matches ? '' : 'none';
      }
    });
  }
}

// Dual export for browser global and CommonJS/Node environments
if (typeof window !== 'undefined') {
  window.SmartSearch = SmartSearch;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartSearch;
}
