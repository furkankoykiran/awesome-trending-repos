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
}

// ============================================================================
// MARKDOWN GENERATION
// ============================================================================

/**
 * Generate the trending table
 */
export function generateTrendingTable(repos) {
  const header = `| Rank | Repository | Stars | Language | 24h Growth | Description |\n|:---:|---|---:|:---:|:---:|---|`;
  const rows = repos.map((repo, i) => {
    const { owner, name, stars, language, growth, description } = repo;
    const color = LANGUAGE_COLORS[language] || 'cccccc';
    const langBadge = language ? `![${language}](https://img.shields.io/badge/${encodeURIComponent(language)}-${color}?style=flat-square)` : '`Unknown`';
    return `| ${i + 1} | [${owner}/${name}](https://github.com/${owner}/${name}) | ${formatNumber(stars)} | ${langBadge} | ${growth > 0 ? formatGrowth(growth) : '-'} | ${escapeMarkdown(description || '').slice(0, 80)} |`;
  });
  return `${header}\n${rows.join('\n')}\n`;
}

/**
 * Generate insights section
 */
export function generateInsightsSection(insights) {
  return `
### 📊 Insights

* **Rising Star**: [${insights.risingStar.owner}/${insights.risingStar.name}](https://github.com/${insights.risingStar.owner}/${insights.risingStar.name}) with +${formatNumber(insights.risingStar.growth)} stars
* **Top Languages**: ${insights.topLanguages.map((l, i) => `${i + 1}. ${l.language}`).join(', ')}
* **Total Stars Tracked**: ${formatNumber(insights.totalStars)}
`;
}

/**
 * Generate language distribution
 */
export function generateLanguageBreakdown(repos) {
  const langMap = new Map();
  repos.forEach(repo => {
    const lang = repo.language || 'Unknown';
    langMap.set(lang, (langMap.get(lang) || 0) + 1);
  });

  const sorted = Array.from(langMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10);
  const bars = sorted.map(([lang, count]) => {
    const percentage = ((count / repos.length) * 100).toFixed(1);
    const bar = '█'.repeat(Math.round(parseFloat(percentage) / 2));
    return `${lang.padEnd(15)} ${bar} ${count} (${percentage}%)`;
  }).join('\n');

  return `### 🏷️ Language Distribution\n\n\`\`\`\n${bars}\n\`\`\`\n`;
}

/**
 * Generate comparison section
 */
export function generateComparisonSection(comparison) {
  let markdown = `\n### 🔄 Changes Since Last Update\n\n`;
  if (comparison.newEntrants.length === 0 && comparison.movers.up.length === 0 && comparison.movers.down.length === 0) {
    return markdown + `*No changes detected since last update.*\n`;
  }

  if (comparison.newEntrants.length > 0) {
    markdown += `**🆕 New Entrants:**\n\n` + comparison.newEntrants.map(r => `• [${r.owner}/${r.name}](https://github.com/${r.owner}/${r.name}) - +${formatNumber(r.starsToday || r.growth)} ⭐`).join('\n') + '\n\n';
  }

  if (comparison.movers.up.length > 0) {
    markdown += `**⏫ Rising:**\n\n` + comparison.movers.up.map(r => `• [${r.key}](https://github.com/${r.key}) - #${r.previousRank} → #${r.currentRank} (${r.change} positions)`).join('\n') + '\n\n';
  }

  return markdown;
}

/**
 * Generate trend graphs/analysis section
 */
export function generateTrendGraphs(analysis) {
  let markdown = `\n### 📊 Trend Analysis\n\n**🔥 Hottest Today (by star growth):**\n\n`;
  const maxGrowth = Math.max(...analysis.starGrowthLeaders.map(r => r.starsToday || r.growth || 0));
  
  analysis.starGrowthLeaders.forEach((r, i) => {
    const growth = r.starsToday || r.growth || 0;
    const bar = '🔥'.repeat(maxGrowth > 0 ? Math.round((growth / maxGrowth) * 10) : 0);
    markdown += `${i + 1}. [+${formatNumber(growth)}] [${r.owner}/${r.name}](https://github.com/${r.owner}/${r.name}) ${bar}\n`;
  });
  
  return markdown;
}

// ============================================================================
// README MANAGEMENT
// ============================================================================

const START_MARKER = '<!-- START_TRENDING -->';
const END_MARKER = '<!-- END_TRENDING -->';

export async function updateReadme(trendingContent, readmePath = 'README.md') {
  const path = resolve(readmePath);
  try {
    const existing = await fs.readFile(path, 'utf-8');
    const start = existing.indexOf(START_MARKER);
    const end = existing.indexOf(END_MARKER);

    if (start === -1 || end === -1) {
      const updated = existing + '\n' + START_MARKER + '\n' + trendingContent + '\n' + END_MARKER;
      await fs.writeFile(path, updated, 'utf-8');
      return { modified: true };
    }

    const updated = existing.slice(0, start + START_MARKER.length) + '\n' + trendingContent + '\n' + existing.slice(end);
    if (existing === updated) return { modified: false };
    
    await fs.writeFile(path, updated, 'utf-8');
    return { modified: true };
  } catch (error) {
    return { modified: false, error: error.message };
  }
}

// ============================================================================
// VALIDATION
// ============================================================================

export function filterValidRepos(repos) {
  const valid = repos.filter(r => r.owner && r.name && typeof r.stars === 'number');
  return { valid, invalid: repos.length - valid.length };
}

export function validateConfig(config) {
  return { valid: !!config };
}
