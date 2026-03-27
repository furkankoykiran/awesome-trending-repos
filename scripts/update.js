#!/usr/bin/env node

/**
 * Awesome Trending Repos - Update Script
 *
 * Fetches trending repositories, compares with historical data,
 * enriches with insights, and updates README.md
 */

import { promises as fs } from 'fs';
import { resolve } from 'path';
import { fetchTrendingWithEnrichment } from './data-sources/github-trending.js';
import { searchTrendingRepos as searchGitHubTrending } from './data-sources/github-search.js';
import * as utils from './utils.js';
import { CONFIG, TRENDING_LANGUAGES } from './config.js';

// Data storage paths
const DATA_DIR = resolve('.data');
const HISTORY_FILE = resolve(DATA_DIR, 'history.json');
const SNAPSHOT_DIR = resolve(DATA_DIR, 'snapshots');
const PUBLIC_DATA_DIR = resolve('public', 'data');
const TRENDING_JSON = resolve(PUBLIC_DATA_DIR, 'trending.json');

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(SNAPSHOT_DIR, { recursive: true });
    await fs.mkdir(PUBLIC_DATA_DIR, { recursive: true });
  } catch (error) {
    // Ignore if already exists
  }
}

/**
 * Load historical data
 */
async function loadHistory() {
  try {
    const content = await fs.readFile(HISTORY_FILE, 'utf-8');
    const history = JSON.parse(content);
    // Validate history structure
    if (!history.snapshots || !Array.isArray(history.snapshots)) {
      console.warn('  ⚠️ Invalid history format, starting fresh');
      return { snapshots: [], lastUpdate: null };
    }
    return history;
  } catch (error) {
    return { snapshots: [], lastUpdate: null };
  }
}

/**
 * Save historical data
 */
async function saveHistory(history) {
  await ensureDataDir();
  await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
}

/**
 * Save daily snapshot
 */
async function saveSnapshot(repos, date) {
  await ensureDataDir();
  const filename = `${date.toISOString().split('T')[0]}.json`;
  const filepath = resolve(SNAPSHOT_DIR, filename);
  await fs.writeFile(filepath, JSON.stringify(repos, null, 2), 'utf-8');
}

/**
 * Load snapshot for a specific date
 */
async function loadSnapshot(date) {
  const filename = `${date.toISOString().split('T')[0]}.json`;
  const filepath = resolve(SNAPSHOT_DIR, filename);
  try {
    const content = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Clean up old snapshots
 */
async function cleanupOldSnapshots() {
  try {
    const files = await fs.readdir(SNAPSHOT_DIR);
    const now = new Date();

    for (const file of files) {
      const filepath = resolve(SNAPSHOT_DIR, file);
      const stats = await fs.stat(filepath);
      const daysSinceModified = (now - stats.mtime) / (1000 * 60 * 60 * 24);

      if (daysSinceModified > CONFIG.historyDays) {
        await fs.unlink(filepath);
      }
    }
  } catch (error) {
    console.warn('  ⚠️ Could not clean up old snapshots');
  }
}

/**
 * Main execution function
 */
async function main() {
  const startTime = Date.now();
  const now = new Date();
  console.log('🚀 Awesome Trending Repos - Update Script');
  console.log(`Started at: ${now.toISOString()}\n`);

  // Validate configuration
  const configValidation = utils.validateConfig(CONFIG);
  if (!configValidation.valid) {
    throw new Error('Invalid configuration');
  }

  let repos = [];
  let dataSource = '';

  try {
    // Step 0: Load historical data
    console.log('📂 Loading historical data...');
    const history = await loadHistory();
    const previousSnapshot = history.snapshots[0] || null;

    if (previousSnapshot) {
      const lastUpdate = new Date(previousSnapshot.date);
      const hoursAgo = Math.floor((now - lastUpdate) / (1000 * 60 * 60));
      console.log(`  ℹ️ Last update: ${hoursAgo} hours ago (${lastUpdate.toISOString()})`);
      console.log(`  ℹ️ Previous repos: ${previousSnapshot.repos.length}\n`);
    } else {
      console.log('  ℹ️ No previous data found - starting fresh\n');
    }

    // Step 1: Fetch trending repositories
    console.log('📡 Fetching trending repositories...');

    // Primary: GitHub trending page scraping
    console.log('  Using GitHub trending page scraping...');
    repos = await fetchTrendingWithEnrichment({ languages: TRENDING_LANGUAGES });
    dataSource = 'GitHub Trending';

    // Supplement with GitHub Search API if needed
    if (repos.length < CONFIG.maxRepos && CONFIG.fallbackToSearch) {
      console.log(`  Supplementing with GitHub Search API (${repos.length} found, target: ${CONFIG.maxRepos})...`);

      try {
        const searchResults = await searchGitHubTrending({
          languages: ['javascript', 'typescript', 'python', 'go', 'rust', 'java', 'c++', 'ruby', 'php'],
          resultsPerLanguage: 10
        });

        // Add unique repos from search results
        const currentKeys = new Set(repos.map(r => `${r.owner}/${r.name}`));
        for (const repo of searchResults) {
          const key = `${repo.owner}/${repo.name}`;
          if (!currentKeys.has(key) && repos.length < CONFIG.maxRepos) {
            repos.push({
              ...repo,
              starsToday: Math.floor((repo.stars || 10000) * 0.01), // Estimate growth
              growth: Math.floor((repo.stars || 10000) * 0.01),
              rank: repos.length + 1
            });
            currentKeys.add(key);
          }
        }

        if (searchResults.length > 0) {
          dataSource += ' + GitHub Search';
        }

        // Sort by starsToday (desc) then by total stars
        repos.sort((a, b) => (b.starsToday || 0) - (a.starsToday || 0) || b.stars - a.stars);
      } catch (searchError) {
        console.warn(`  ⚠️ Search API failed: ${searchError.message}`);
      }
    }

    if (repos.length === 0) {
      throw new Error('No repositories found from any data source');
    }

    console.log(`  ✅ Found ${repos.length} repositories from ${dataSource}\n`);

    // Step 2: Validate data
    console.log('🔍 Validating repository data...');
    const validation = utils.filterValidRepos(repos);
    repos = validation.valid;
    console.log(`  ✅ ${repos.length} valid repositories\n`);

    // Step 3: Filter by popular languages
    if (CONFIG.filterLanguages) {
      console.log('🏷️ Filtering by popular languages...');
      repos = utils.filterPopularLanguages(repos);
      console.log(`  ✅ ${repos.length} repositories after filtering\n`);
    }

    // Step 4: Augment with historical data if needed
    if (repos.length < CONFIG.maxRepos && history.snapshots.length > 0) {
      console.log(`📜 Augmenting with historical data (target: ${CONFIG.maxRepos})...`);

      const currentKeys = new Set(repos.map(r => `${r.owner}/${r.name}`));
      const historicalRepos = [];

      for (const snapshot of history.snapshots.slice(1)) {
        for (const repo of snapshot.repos) {
          const key = `${repo.owner}/${repo.name}`;
          if (!currentKeys.has(key) && repo.language) {
            historicalRepos.push({
              ...repo,
              starsToday: Math.floor((repo.starsToday || 0) * 0.5) || 0,
              growth: Math.floor((repo.starsToday || 0) * 0.5) || 0,
              isHistorical: true
            });
            currentKeys.add(key);
          }
        }

        if (repos.length + historicalRepos.length >= CONFIG.maxRepos) {
          break;
        }
      }

      historicalRepos.sort((a, b) => b.stars - a.stars);
      repos = [...repos, ...historicalRepos.slice(0, CONFIG.maxRepos - repos.length)];
      console.log(`  ✅ Augmented to ${repos.length} repositories\n`);
    }

    // Step 5: Enrichment - Skipped as requested (focus on Top Repos)

    // Step 6: Limit to top N
    console.log(`✂️ Limiting to top ${CONFIG.maxRepos} repositories...`);
    repos = repos.slice(0, CONFIG.maxRepos);
    console.log(`  ✅ Retained ${repos.length} repositories\n`);

    // Step 7: Compare with historical data
    let historicalComparison = null;
    let trendAnalysis = null;

    if (previousSnapshot && CONFIG.includeHistoricalComparison) {
      console.log('📊 Comparing with previous data...');
      const previousRepos = previousSnapshot.repos;
      historicalComparison = utils.generateHistoricalComparison(repos, previousRepos);
      trendAnalysis = utils.generateTrendAnalysis(repos, previousRepos);
    }

    // Step 8: Generate insights
    const insights = utils.generateInsights(repos);
    console.log(`📊 Generated insights for ${repos.length} repos\n`);

    // Step 9: Save snapshot
    console.log('💾 Saving snapshot...');
    const snapshot = {
      date: now.toISOString(),
      repos,
      insights: {
        risingStar: insights.risingStar,
        topLanguages: insights.topLanguages,
        totalStars: insights.totalStars
      }
    };
    await saveSnapshot(repos, now);

    // Update history
    history.snapshots.unshift(snapshot);
    history.lastUpdate = now.toISOString();

    // Keep only recent history in memory file
    history.snapshots = history.snapshots.slice(0, CONFIG.historyDays);
    await saveHistory(history);
    await cleanupOldSnapshots();
    
    // Save for frontend
    console.log('🌐 Saving public data for frontend...');
    await fs.writeFile(TRENDING_JSON, JSON.stringify(snapshot, null, 2), 'utf-8');
    
    console.log('  ✅ Snapshot saved\n');

    // Step 10: Summary
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('✨ Update completed successfully!');
    console.log(`⏱️ Elapsed time: ${elapsed}s`);
    console.log(`📦 Repositories processed: ${repos.length}`);
    console.log(`📝 public/data/trending.json updated`);

    return {
      success: true,
      reposCount: repos.length,
      dataSource,
      elapsed,
      historicalComparison
    };

  } catch (error) {
    console.error('\n❌ Error during update:');
    console.error(`  ${error.message}`);
    throw error;
  }
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export { main };
