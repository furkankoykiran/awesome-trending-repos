/**
 * Fetch trending repositories from GitHub's trending page
 * GitHub trending URL: https://github.com/trending
 *
 * @param {Object} options - Fetch options
 * @param {string} options.language - Filter by programming language
 * @param {string} options.since - Time period: 'daily' (default), 'weekly', 'monthly'
 * @param {string} options.spokenLanguage - Filter by spoken language code
 * @returns {Promise<Array>} Array of trending repositories
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import { fillMissingLanguages } from './github-enrich.js';
import { TRENDING_LANGUAGES } from '../config.js';

export async function fetchGitHubTrending(options = {}) {
  const {
    language = '',
    since = 'daily',
    spokenLanguage = ''
  } = options;

  // Build URL for GitHub trending page manually
  // Note: GitHub trending URL format is github.com/trending/{language}?since={daily}
  let url = 'https://github.com/trending';
  if (language && language !== '') {
    // For specific languages, the path is /trending/{language}
    url = `https://github.com/trending/${language}`;
  }

  const params = new URLSearchParams();
  if (since) {
    params.append('since', since);
  }
  if (spokenLanguage) {
    params.append('spoken_language_code', spokenLanguage);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AwesomeTrendingRepos/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 15000
    });

    return parseTrendingPage(response.data);
  } catch (error) {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        // Language-specific trending page may not exist, return empty
        return [];
      }
      throw new Error(`GitHub returned ${status}: ${error.response.statusText}`);
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - GitHub might be rate limiting or slow');
    }
    throw new Error(`Failed to fetch trending: ${error.message}`);
  }
}

/**
 * Parse HTML from GitHub trending page
 */
function parseTrendingPage(html) {
  const $ = cheerio.load(html);
  const repos = [];

  // GitHub may use different selectors over time
  const articleSelectors = [
    'article.Box-row',
    'article[class*="Box-row"]',
    'li[class*="repo-list"]',
    '.repo-list-item'
  ];

  let articles = null;
  for (const selector of articleSelectors) {
    articles = $(selector);
    if (articles.length > 0) break;
  }

  if (articles.length === 0) {
    console.warn('  ⚠️ No trending articles found - GitHub may have changed the page structure');
    return [];
  }

  articles.each((index, element) => {
    try {
      const repo = parseArticleElement($, element, index);
      if (repo && repo.owner && repo.name) {
        repos.push(repo);
      }
    } catch (error) {
      console.warn(`  ⚠️ Failed to parse article ${index}: ${error.message}`);
    }
  });

  return repos;
}

/**
 * Parse a single article element
 */
function parseArticleElement($, element, index) {
  const $el = $(element);

  // Extract owner and name from the repository link
  const repoLink = $el.find('h2 a').attr('href') ||
                   $el.find('h1 a').attr('href') ||
                   $el.find('a[href*="/"]').first().attr('href') || '';

  const [, owner, name] = repoLink.match(/^\/([^/]+)\/([^/]+)/) || [];
  if (!owner || !name) return null;

  // Extract description - try multiple selectors
  let description = '';
  const descSelectors = ['p', '.py-1', 'div[itemprop="description"]'];
  for (const selector of descSelectors) {
    const text = $el.find(selector).first().text().trim();
    if (text && text.length > 10) {
      description = text;
      break;
    }
  }

  // Extract programming language - try multiple selectors
  let language = '';
  const langSelectors = [
    '[itemprop="programmingLanguage"]',
    'span[itemprop="programmingLanguage"]',
    '.d-inline-block.ml-0'
  ];
  for (const selector of langSelectors) {
    const text = $el.find(selector).first().text().trim();
    if (text) {
      language = text;
      break;
    }
  }

  // Extract star count
  const starsText = $el.find('a[href*="/stargazers"]').first().text().trim();
  const stars = parseStars(starsText);

  // Extract stars today
  const starsTodayText = $el.find('span.d-inline-block.float-sm-right').text().trim();
  const starsToday = parseStarsToday(starsTodayText);

  // Extract fork count
  const forksText = $el.find('a[href*="/forks"]').first().text().trim();
  const forks = parseStars(forksText);

  // Current period rank (from position in list)
  const rank = index + 1;

  return {
    owner,
    name,
    description,
    language,
    stars,
    forks,
    starsToday,
    growth: starsToday,
    rank,
    url: `https://github.com/${owner}/${name}`,
    fetchedAt: new Date().toISOString(),
    source: 'github-trending'
  };
}

/**
 * Parse star count from text (e.g., "123.4k" -> 123400)
 */
function parseStars(text) {
  if (!text) return 0;

  const cleaned = text.replace(/,/g, '').toLowerCase();

  if (cleaned.endsWith('k')) {
    return Math.floor(parseFloat(cleaned.slice(0, -1)) * 1000);
  }
  if (cleaned.endsWith('m')) {
    return Math.floor(parseFloat(cleaned.slice(0, -1)) * 1000000);
  }

  return parseInt(cleaned, 10) || 0;
}

/**
 * Parse stars today from text (e.g., "123 stars today" -> 123)
 */
function parseStarsToday(text) {
  if (!text) return 0;

  const match = text.match(/(\d+(?:[.,]\d+)?[kKmM]?)\s*stars?\s*today/i);
  if (!match) return 0;

  return parseStars(match[1]);
}

/**
 * Fetch trending for multiple languages and deduplicate
 */
export async function fetchMultiLanguageTrending(languages = ['javascript', 'python']) {
  // Skip empty language string - base trending page seems to have issues
  const filteredLanguages = languages.filter(l => l && l.trim() !== '');

  const results = await Promise.allSettled(
    filteredLanguages.map(lang => fetchGitHubTrending({ language: lang, since: 'daily' }))
  );

  const allRepos = [];
  const seen = new Set();

  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const repo of result.value) {
        const key = `${repo.owner}/${repo.name}`;
        if (!seen.has(key)) {
          seen.add(key);
          allRepos.push(repo);
        }
      }
    } else {
      console.warn(`  ⚠️ Failed to fetch trending: ${result.reason.message}`);
    }
  }

  // Sort by stars today (descending)
  return allRepos.sort((a, b) => b.starsToday - a.starsToday);
}

/**
 * Fetch trending with fallback language enrichment
 * This ensures all repos have language information
 */
export async function fetchTrendingWithEnrichment(options = {}) {
  const { languages = [''] } = options;

  // Fetch trending repos
  let repos = await fetchMultiLanguageTrending(languages);

  // Fill missing languages via GitHub API
  const missingLangCount = repos.filter(r => !r.language).length;
  if (missingLangCount > 0) {
    console.log(`  📝 Enriching ${missingLangCount} repos with missing languages...`);
    repos = await fillMissingLanguages(repos);
  }

  return repos;
}

/**
 * Re-export TRENDING_LANGUAGES as POPULAR_LANGUAGES for backward compatibility
 */
export { TRENDING_LANGUAGES as POPULAR_LANGUAGES } from '../config.js';

export default {
  fetchGitHubTrending,
  fetchMultiLanguageTrending,
  fetchTrendingWithEnrichment,
  POPULAR_LANGUAGES: TRENDING_LANGUAGES
};
