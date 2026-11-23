#!/usr/bin/env node

/**
 * Verify the deployable output. Runs after prerender so CI fails on an empty
 * shell, a missing hashed asset or a missing machine-readable file instead of
 * publishing a broken page.
 */

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

const DIST = resolve('dist');
const BASE = '/awesome-trending-repos/';

const read = (file) => fs.readFile(resolve(DIST, file), 'utf8');
const exists = (file) =>
  fs
    .access(resolve(DIST, file))
    .then(() => true)
    .catch(() => false);

async function main() {
  const [html, snapshot, historyRaw] = await Promise.all([
    read('index.html'),
    read('data/trending.json'),
    read('data/history.json'),
  ]);
  const data = JSON.parse(snapshot);
  const history = JSON.parse(historyRaw);
  const problems = [];

  if (html.length < 20_000) problems.push('dist/index.html looks like an empty shell');
  if (html.includes('<div id="root"></div>')) problems.push('dist/index.html was not prerendered');
  if (!html.includes('window.__ATR_DATA__')) problems.push('hydration snapshot is missing');
  if (!html.includes('window.__ATR_HISTORY__')) problems.push('history snapshot is missing');
  if (!html.includes('"@type":"WebApplication"') && !html.includes('"@type": "WebApplication"')) {
    problems.push('WebApplication JSON-LD is missing');
  }
  if (!html.includes(`${BASE}assets/`)) problems.push(`asset URLs do not use the ${BASE} base path`);

  if (!Array.isArray(history.series) || history.series.length === 0) {
    problems.push('data/history.json has no daily series');
  } else if (!Number.isFinite(history.days) || history.days < 1) {
    problems.push('data/history.json has an invalid day count');
  }
  if (!html.includes('days of history')) {
    problems.push('prerendered HTML does not mention the retained history');
  }

  for (const repo of data.repos.slice(0, 3)) {
    const name = `${repo.owner}/${repo.name}`;
    if (!html.includes(name)) problems.push(`prerendered HTML is missing ${name}`);
  }

  const required = [
    'sitemap.xml',
    'llms.txt',
    'robots.txt',
    'ai.txt',
    'manifest.webmanifest',
    '.well-known/security.txt',
    'data/feed.json',
    'data/history.json',
  ];
  const checks = await Promise.all(required.map(exists));
  required.forEach((file, index) => {
    if (!checks[index]) problems.push(`dist/${file} is missing`);
  });

  const asset = html.match(/src="([^"]*\/assets\/[^"]+\.js)"/);
  if (!asset) {
    problems.push('no hashed JavaScript entry found in dist/index.html');
  } else {
    const path = asset[1].replace(BASE, '');
    if (!(await exists(path))) problems.push(`referenced asset does not exist: ${path}`);
  }

  if (problems.length > 0) {
    throw new Error(`Build verification failed:\n- ${problems.join('\n- ')}`);
  }

  console.log(
    `Verified dist: ${data.repos.length} repos prerendered, metadata and machine-readable files present.`
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
