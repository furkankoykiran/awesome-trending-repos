#!/usr/bin/env node

/**
 * Rebuild the derived history files from the raw daily snapshots.
 *
 * The snapshots in `.data/snapshots/` are the source of truth and are kept
 * forever. This script is safe to re-run at any time: it regenerates
 * `.data/history.json`, the compact `public/data/history.json` used by the
 * dashboard and the deployment feed, without fetching anything from GitHub.
 *
 *   node scripts/rebuild-history.js
 */

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { buildFeed, buildPublicHistory, createHistoryEntry } from './history.js';

const DATA_DIR = resolve('.data');
const SNAPSHOT_DIR = resolve(DATA_DIR, 'snapshots');
const HISTORY_FILE = resolve(DATA_DIR, 'history.json');
const PUBLIC_DIR = resolve('public', 'data');
const PUBLIC_HISTORY = resolve(PUBLIC_DIR, 'history.json');
const FEED_JSON = resolve(PUBLIC_DIR, 'feed.json');

async function main() {
  const files = (await fs.readdir(SNAPSHOT_DIR))
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .sort();

  if (files.length === 0) {
    throw new Error(`No snapshots found in ${SNAPSHOT_DIR}`);
  }

  const entries = [];
  for (const file of files) {
    const repos = JSON.parse(await fs.readFile(resolve(SNAPSHOT_DIR, file), 'utf8'));
    if (!Array.isArray(repos) || repos.length === 0) {
      console.warn(`  skipping ${file}: not a repository snapshot`);
      continue;
    }
    const fetchedAt = repos.find((repo) => repo.fetchedAt)?.fetchedAt;
    const date = fetchedAt && Number.isFinite(Date.parse(fetchedAt))
      ? fetchedAt
      : `${file.slice(0, 10)}T00:00:00.000Z`;
    entries.push(createHistoryEntry(repos, date));
  }

  const snapshots = entries.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
  const publicHistory = buildPublicHistory(snapshots);
  const feed = buildFeed(snapshots);

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(HISTORY_FILE, JSON.stringify({ snapshots, lastUpdate: snapshots[0].date }, null, 2), 'utf8'),
    fs.writeFile(PUBLIC_HISTORY, JSON.stringify(publicHistory, null, 2), 'utf8'),
    fs.writeFile(FEED_JSON, JSON.stringify(feed, null, 2), 'utf8'),
  ]);

  console.log(`Rebuilt history from ${snapshots.length} snapshots`);
  console.log(`  ${publicHistory.firstDate} -> ${publicHistory.lastDate} (${publicHistory.days} days)`);
  console.log(`  ${publicHistory.uniqueRepos} unique repositories, feed entries: ${feed.length}`);
}

main().catch((error) => {
  console.error(`Could not rebuild history: ${error.message}`);
  process.exitCode = 1;
});
