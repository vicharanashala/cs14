/**
 * AI Query Improvement Service
 * Provides intelligent query reformulation suggestions.
 * Uses mock responses when no LLM is configured.
 */

const MOCK_SUGGESTIONS = [
  "Try searching with different keywords",
  "Check if your spelling is correct",
  "Try using shorter phrases",
  "Use synonyms for better results",
];

function getMockImprovement(originalQuery) {
  const words = originalQuery.split(" ").filter(Boolean);

  // Simulate different improvement scenarios based on query length
  if (words.length <= 2) {
    return {
      improvedQuery: originalQuery,
      suggestions: [
        "Try adding more context to your search",
        "Include the category name in your query",
        "Break your question into smaller parts",
      ],
      confidence: 0.6,
      intent: "short_query",
    };
  }

  if (words.length > 8) {
    return {
      improvedQuery: words.slice(0, 6).join(" "),
      suggestions: [
        "Shortened to most important terms",
        "Try searching for just the key phrase",
      ],
      confidence: 0.7,
      intent: "long_query",
    };
  }

  // Normal query - suggest minor refinements
  return {
    improvedQuery: originalQuery,
    suggestions: [
      "Search results are ordered by relevance",
      "Try different keyword combinations",
    ],
    confidence: 0.8,
    intent: "normal",
  };
}

function getIntentHints(query) {
  const q = query.toLowerCase();

  if (q.includes("how") || q.includes("what") || q.includes("why")) {
    return { type: "explanation", hint: "Looking for an explanation?" };
  }
  if (q.includes("when") || q.includes("date") || q.includes("time")) {
    return { type: "timing", hint: "Looking for scheduling or date info?" };
  }
  if (q.includes("cost") || q.includes("fee") || q.includes("pay")) {
    return { type: "cost", hint: "Looking for cost-related info?" };
  }
  if (q.includes("contact") || q.includes("reach") || q.includes("email")) {
    return { type: "contact", hint: "Need to contact someone?" };
  }

  return { type: "general", hint: null };
}

/**
 * Improve a search query using AI (or mock if unconfigured)
 * @param {string} query - Original search query
 * @param {object} options - { apiKey, model, mockMode }
 * @returns {Promise<{improvedQuery, suggestions, confidence, intent}>}
 */
async function improveQuery(query, options = {}) {
  const { apiKey, model, mockMode = true } = options;

  // If we have a real API key and mockMode is false, use the real LLM
  // For now, always use mock since we don't have a configured LLM
  const result = getMockImprovement(query);
  result.intentHint = getIntentHints(query);

  return result;
}

/**
 * Auto-complete suggestions for query input
 * @param {string} partial - Partial query string
 * @param {string[]} knownTerms - Known FAQ keywords/titles for suggestions
 * @returns {string[]} Top suggestions
 */
function getAutocomplete(partial, knownTerms = []) {
  if (!partial || partial.length < 2) return [];

  const p = partial.toLowerCase();
  const scored = knownTerms
    .map(term => ({
      term,
      score: term.toLowerCase().includes(p)
        ? (term.toLowerCase().startsWith(p) ? 2 : 1)
        : 0,
    }))
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(s => s.term);
}

module.exports = { improveQuery, getAutocomplete, getIntentHints };