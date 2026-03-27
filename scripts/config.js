/**
 * Configuration for Awesome Trending Repos
 * Centralized settings for data fetching, processing, and display
 */

/**
 * Popular programming languages to filter by
 */
export const POPULAR_LANGUAGES = new Set([
  'JavaScript',
  'TypeScript',
  'Python',
  'Go',
  'Rust',
  'Java',
  'C++',
  'Ruby',
  'PHP',
  'Swift',
  'Kotlin',
  'Dart',
  'Shell',
  'HTML',
  'CSS',
  'C',
  'C#',
  'Scala',
  'Elixir',
  'Haskell'
]);

/**
 * GitHub language badge colors (hex format without #)
 */
export const LANGUAGE_COLORS = {
  JavaScript: 'f1e05a',
  TypeScript: '3178c6',
  Python: '3572A5',
  Java: 'b07219',
  'C++': 'f34b7d',
  C: '555555',
  Go: '00ADD8',
  Rust: 'dea584',
  Ruby: '701516',
  PHP: '4F5D95',
  Swift: 'F05138',
  Kotlin: 'A97BFF',
  Dart: '00B4AB',
  Shell: '89e051',
  HTML: 'e34c26',
  CSS: '563d7c',
  'C#': '239120',
  Scala: 'c22d40',
  Elixir: '6e4a7e',
  Haskell: '5e5086'
};

/**
 * Main configuration object
 */
export const CONFIG = {
  // Data collection settings
  maxRepos: 25,  // Top 25 repos is enough - cleaner and faster
  historyDays: 7,
  fallbackToSearch: true,
  filterLanguages: true,

  // Display settings
  includeInsights: true,
  includeLanguageBreakdown: true,
  includeHistoricalComparison: true,
  includeTrendGraphs: true,
  includeHealthMetrics: true,
  includeTopics: true,

  // GitHub API settings
  apiBatchSize: 10,
  apiDelayMs: 1000,
  apiMaxRetries: 3,

  // Enrichment settings - simplified for speed
  enrichRepos: false,  // DISABLED - causes rate limits and slowdown
  enrichTopics: false,
  enrichLicense: false,
  enrichStats: false,

  // Badge settings
  badgeStyle: 'flat-square',

  // Data quality thresholds
  minDescriptionLength: 10,
  maxDescriptionLength: 100,
  minStarsForTrending: 100,

  // Health metrics
  staleThresholdDays: 30,
  activeThresholdDays: 7,

  // Display limits
  topReposForHealth: 15,
  topTopicsToShow: 15,
  maxConsistentPerformers: 5,
  maxMoversToShow: 5
};

/**
 * Languages to fetch trending for
 * Note: Empty string (all languages) seems to have issues with GitHub's current structure
 */
export const TRENDING_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'go',
  'rust',
  'java',
  'c++',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'dart',
  'shell',
  'html',
  'css'
];

export default CONFIG;
