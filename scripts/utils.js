import { promises as fs } from 'fs';
import { resolve } from 'path';
import { CONFIG, LANGUAGE_COLORS } from './config.js';

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format a number with K/M suffixes
 */
export function formatNumber(num) {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

/**
 * Escape markdown special characters
 */
export function escapeMarkdown(text) {
  if (!text) return '';
  return text.replace(/\|/g, '\\|').replace(/\n/g, ' ').replace(/\r/g, '');
}

/**
 * Format growth with sign and emoji
 */
export function formatGrowth(growth) {
  if (!growth || growth === 0) return '-';
  const sign = growth > 0 ? '+' : '';
  return `${sign}${formatNumber(growth)} ⭐`;
}

// ============================================================================
// INSIGHTS & DATA PROCESSING
// ============================================================================

/**
 * Filter popular programming languages
 */
export function filterPopularLanguages(repos) {
  const popularLanguages = new Set([
    'JavaScript', 'TypeScript', 'Python', 'Go', 'Rust', 
    'Java', 'C++', 'Ruby', 'PHP', 'Swift', 'Shell', 'HTML'
  ]);
  return repos.filter(repo => !repo.language || popularLanguages.has(repo.language));
}

/**
 * Generate comprehensive insights
 */
export function generateInsights(repos) {
  const risingStar = repos.reduce((max, repo) => (repo.growth || 0) > (max.growth || 0) ? repo : max, repos[0] || { owner: 'N/A', name: 'N/A', growth: 0 });
  
  const langCounts = new Map();
  repos.forEach(repo => {
    const lang = repo.language || 'Unknown';
    langCounts.set(lang, (langCounts.get(lang) || 0) + 1);
  });

  const topLanguages = Array.from(langCounts.entries())
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    risingStar: { owner: risingStar.owner, name: risingStar.name, growth: risingStar.growth || 0 },
    topLanguages,
    totalStars: repos.reduce((sum, repo) => sum + (repo.stars || 0), 0),
    newEntrantsCount: repos.filter(r => r.isNew).length
  };
}

/**
 * Compare current repos with previous repos
 */
export function generateHistoricalComparison(currentRepos, previousRepos) {
  const previousKeys = new Set(previousRepos.map(r => `${r.owner}/${r.name}`));
  
  const newEntrants = currentRepos
    .filter(repo => !previousKeys.has(`${repo.owner}/${repo.name}`))
    .sort((a, b) => (b.starsToday || 0) - (a.starsToday || 0))
    .slice(0, 5);

  const currentMap = new Map(currentRepos.map((r, i) => [`${r.owner}/${r.name}`, i + 1]));
  const previousMap = new Map(previousRepos.map((r, i) => [`${r.owner}/${r.name}`, i + 1]));

  const movers = { up: [], down: [] };
  for (const [key, currentRank] of currentMap) {
    const previousRank = previousMap.get(key);
    if (previousRank) {
      const change = previousRank - currentRank;
      if (change > 0) movers.up.push({ key, change, currentRank, previousRank });
      else if (change < 0) movers.down.push({ key, change: Math.abs(change), currentRank, previousRank });
    }
  }

  return {
    newEntrants,
    movers: {
      up: movers.up.sort((a, b) => b.change - a.change).slice(0, 5),
      down: movers.down.sort((a, b) => b.change - a.change).slice(0, 5)
    }
  };
}

/**
 * Generate trend analysis
 */
export function generateTrendAnalysis(currentRepos, previousRepos) {
  return {
    starGrowthLeaders: [...currentRepos]
      .sort((a, b) => (b.starsToday || 0) - (a.starsToday || 0))
      .slice(0, 5)
  };
}export function filterValidRepos(repos) {
  const valid = repos.filter(r => r.owner && r.name && typeof r.stars === 'number');
  return { valid, invalid: repos.length - valid.length };
}

export function validateConfig(config) {
  return { valid: !!config };
}
