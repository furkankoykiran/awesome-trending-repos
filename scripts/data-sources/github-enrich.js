/**
 * GitHub Repository Enrichment Module
 * Fetches additional metadata for repositories using GitHub API
 */

import { Octokit } from 'octokit';
import { throttling } from '@octokit/plugin-throttling';
import { retry } from '@octokit/plugin-retry';

// Create Octokit with throttling and retry
const MyOctokit = Octokit.plugin(throttling, retry);

/**
 * Initialize Octokit instance with retry and throttling
 */
function getOctokit() {
  const token = process.env.GITHUB_TOKEN;

  return new MyOctokit({
    auth: token || undefined,
    throttle: {
      onRateLimit: (retryAfter, options, octokit) => {
        octokit.log.warn(`Rate limit hit for ${options.method} ${options.url}`);
        if (options.request.retryCount <= 2) {
          octokit.log.info(`Retrying after ${retryAfter}s`);
          return true;
        }
        return false;
      },
      onSecondaryRateLimit: (retryAfter, options, octokit) => {
        octokit.log.warn(`Secondary rate limit for ${options.method} ${options.url}`);
        return false; // Don't retry secondary rate limits
      }
    },
    retry: {
      doNotRetry: ['404', '422'] // Don't retry on these errors
    }
  });
}

/**
 * Fetch repository language if missing
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Language data
 */
export async function fetchRepositoryLanguage(owner, repo) {
  const octokit = getOctokit();

  try {
    const response = await octokit.rest.repos.get({
      owner,
      repo
    });

    return {
      language: response.data.language || null,
      hasLanguage: !!response.data.language
    };
  } catch (error) {
    if (error.status === 404) {
      return { language: null, hasLanguage: false };
    }
    throw error;
  }
}

/**
 * Fetch repository topics
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Array>} Array of topic names
 */
export async function fetchRepositoryTopics(owner, repo) {
  const octokit = getOctokit();

  try {
    const response = await octokit.rest.repos.getAllTopics({
      owner,
      repo,
      mediaType: {
        previews: ['mercy']
      }
    });

    return response.data.names || [];
  } catch (error) {
    // Topics endpoint may not be available for all repos
    return [];
  }
}

/**
 * Fetch repository statistics (issues, PRs, etc.)
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} Repository statistics
 */
export async function fetchRepositoryStats(owner, repo) {
  const octokit = getOctokit();

  try {
    const response = await octokit.rest.repos.get({
      owner,
      repo
    });

    return {
      openIssues: response.data.open_issues_count || 0,
      forks: response.data.forks_count || 0,
      watchers: response.data.subscribers_count || 0,
      size: response.data.size || 0,
      pushedAt: response.data.pushed_at || null,
      createdAt: response.data.created_at || null,
      updatedAt: response.data.updated_at || null,
      license: response.data.license?.name || null,
      isFork: response.data.fork || false,
      isArchived: response.data.archived || false,
      defaultBranch: response.data.default_branch || 'main'
    };
  } catch (error) {
    if (error.status === 404) {
      return null;
    }
    throw error;
  }
}

/**
 * Enrich a single repository with metadata
 * @param {Object} repo - Repository object with owner and name
 * @param {Object} options - Enrichment options
 * @returns {Promise<Object>} Enriched repository object
 */
export async function enrichRepository(repo, options = {}) {
  const { owner, name } = repo;
  const { topics = true, stats = true, language = false } = options;

  const enriched = { ...repo };

  try {
    // Fetch language if missing
    if (language && !repo.language) {
      try {
        const langData = await fetchRepositoryLanguage(owner, name);
        if (langData.hasLanguage) {
          enriched.language = langData.language;
        }
      } catch {
        // Language fetch failed, continue without it
      }
    }

    // Fetch topics (skip if disabled to save API quota)
    if (topics) {
      try {
        const topicNames = await fetchRepositoryTopics(owner, name);
        enriched.topics = topicNames;
      } catch {
        enriched.topics = [];
      }
    }

    // Fetch stats (this is the most useful data)
    if (stats) {
      try {
        const statsData = await fetchRepositoryStats(owner, name);
        if (statsData) {
          Object.assign(enriched, statsData);
        }
      } catch {
        // Stats fetch failed, continue without them
      }
    }
  } catch (error) {
    console.warn(`  ⚠️ Could not enrich ${owner}/${name}: ${error.message}`);
  }

  return enriched;
}

/**
 * Batch enrich multiple repositories
 * @param {Array} repos - Array of repository objects
 * @param {Object} options - Enrichment options
 * @returns {Promise<Array>} Array of enriched repositories
 */
export async function batchEnrichRepositories(repos, options = {}) {
  const {
    batchSize = 10,
    delayMs = 500,
    topics = true,
    stats = true,
    language = true,
    onProgress = null
  } = options;

  const results = [];
  const totalBatches = Math.ceil(repos.length / batchSize);

  for (let i = 0; i < repos.length; i += batchSize) {
    const batch = repos.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    try {
      const enriched = await Promise.allSettled(
        batch.map(repo => enrichRepository(repo, { topics, stats, language }))
      );

      for (const result of enriched) {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          console.warn(`  ⚠️ Enrichment failed: ${result.reason.message}`);
        }
      }

      // Progress callback
      if (onProgress) {
        onProgress({
          batch: batchNumber,
          totalBatches,
          processed: Math.min(i + batchSize, repos.length),
          total: repos.length
        });
      }

      // Delay between batches to respect rate limits
      if (i + batchSize < repos.length && delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.warn(`  ⚠️ Batch ${batchNumber} failed: ${error.message}`);
    }
  }

  return results;
}

/**
 * Quick enrichment for missing languages only
 * @param {Array} repos - Array of repository objects
 * @returns {Promise<Array>} Repositories with filled languages
 */
export async function fillMissingLanguages(repos) {
  const missing = repos.filter(r => !r.language);
  if (missing.length === 0) {
    return repos;
  }

  console.log(`  📝 Fetching languages for ${missing.length} repos...`);

  const enriched = await batchEnrichRepositories(missing, {
    batchSize: 15,
    delayMs: 300,
    topics: false,
    stats: false,
    language: true
  });

  // Merge enriched data back
  const enrichedMap = new Map(
    enriched.map(r => [`${r.owner}/${r.name}`, r])
  );

  return repos.map(repo => {
    const key = `${repo.owner}/${repo.name}`;
    const enrichedRepo = enrichedMap.get(key);
    return enrichedRepo && enrichedRepo.language ? enrichedRepo : repo;
  });
}

export default {
  enrichRepository,
  batchEnrichRepositories,
  fillMissingLanguages,
  fetchRepositoryLanguage,
  fetchRepositoryTopics,
  fetchRepositoryStats
};
