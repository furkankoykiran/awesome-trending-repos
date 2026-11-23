#!/usr/bin/env node

/**
 * Prerender the dashboard into dist/index.html.
 *
 * Vite builds the client bundle first, then an SSR bundle (.ssr/entry-server.js).
 * This script renders the same React tree with the current snapshot, embeds the
 * snapshot for hydration, and adds the structured data that crawlers and AI
 * agents need. A failure exits non-zero so CI never deploys an empty shell.
 */

import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const DIST_INDEX = resolve('dist/index.html');
const TRENDING = resolve('public/data/trending.json');
const FEED = resolve('public/data/feed.json');
const SSR_ENTRY = resolve('.ssr/entry-server.js');
const SITE_URL = 'https://furkankoykiran.com.tr/awesome-trending-repos/';

function escapeForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

function readJson(file, fallback) {
  return fs.readFile(file, 'utf8').then(JSON.parse).catch(() => fallback);
}

function buildStructuredData(snapshot) {
  const repos = Array.isArray(snapshot.repos) ? snapshot.repos : [];
  const author = {
    '@type': 'Person',
    name: 'Furkan Köykıran',
    url: 'https://furkankoykiran.com.tr/',
  };
  const app = {
    '@type': 'WebApplication',
    '@id': `${SITE_URL}#app`,
    name: 'Awesome Trending Repos',
    url: SITE_URL,
    description:
      'A daily-updated dashboard of the fastest-growing open-source repositories on GitHub, with star growth, language insights and a seven-day snapshot history.',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    isAccessibleForFree: true,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author,
    creator: author,
    dateModified: snapshot.date,
    inLanguage: 'en',
  };
  const items = repos.slice(0, 25).map((repo, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'SoftwareSourceCode',
      name: `${repo.owner}/${repo.name}`,
      description: repo.description || undefined,
      codeRepository: repo.url,
      programmingLanguage: repo.language || undefined,
      interactionStatistic: {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: repo.stars || 0,
      },
    },
  }));
  return {
    '@context': 'https://schema.org',
    '@graph': [
      app,
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}#repositories`,
        name: 'Trending repositories today',
        numberOfItems: items.length,
        itemListElement: items,
      },
    ],
  };
}

function buildSitemap(snapshot) {
  const lastmod = snapshot.date ? new Date(snapshot.date).toISOString().slice(0, 10) : undefined;
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
}

function buildLlms(snapshot) {
  const repos = Array.isArray(snapshot.repos) ? snapshot.repos.slice(0, 25) : [];
  const lines = repos.map(
    (repo, index) =>
      `${index + 1}. ${repo.owner}/${repo.name} (${repo.language || 'unknown'}, ${repo.stars || 0} stars, +${repo.starsToday || 0} today) - ${repo.url}`
  );
  return `# Awesome Trending Repos

> A daily-updated, auto-curated dashboard of the fastest-growing open-source repositories on GitHub.

Canonical: ${SITE_URL}
Snapshot: ${snapshot.date || 'unknown'}
Data: ${SITE_URL}data/trending.json

## Today's repositories

${lines.join('\n')}

## How to cite

Cite the dashboard as "Awesome Trending Repos, Furkan Köykıran" with the canonical URL and the snapshot date. Star counts and daily growth are captured by GitHub Actions and may change between snapshots.
`;
}

async function main() {
  const [html, snapshot, feed] = await Promise.all([
    fs.readFile(DIST_INDEX, 'utf8'),
    readJson(TRENDING, null),
    readJson(FEED, []),
  ]);

  if (!snapshot || !Array.isArray(snapshot.repos) || snapshot.repos.length === 0) {
    throw new Error('public/data/trending.json is missing or has no repositories');
  }

  const { render } = await import(pathToFileURL(SSR_ENTRY).href);
  const markup = render(snapshot, Array.isArray(feed) ? feed : []);

  if (!markup || markup.length < 1000) {
    throw new Error('SSR render returned too little markup');
  }

  const dataScript = `<script>window.__ATR_DATA__=${escapeForScript(snapshot)};window.__ATR_FEED__=${escapeForScript(
    Array.isArray(feed) ? feed : []
  )};</script>`;
  const structured = `<script type="application/ld+json">${escapeForScript(
    buildStructuredData(snapshot)
  )}</script>`;

  let output = html.replace('<div id="root"></div>', `<div id="root">${markup}</div>`);
  if (output === html) {
    throw new Error('Could not find <div id="root"></div> in dist/index.html');
  }
  output = output.replace('</head>', `${structured}\n</head>`);
  output = output.replace(
    /<script type="module" crossorigin src="([^"]+)"><\/script>/,
    `${dataScript}\n    <script type="module" crossorigin src="$1"></script>`
  );

  if (!output.includes(dataScript.slice(0, 60))) {
    throw new Error('Could not inject the hydration snapshot into dist/index.html');
  }

  await Promise.all([
    fs.writeFile(DIST_INDEX, output, 'utf8'),
    fs.writeFile(resolve('dist/sitemap.xml'), buildSitemap(snapshot), 'utf8'),
    fs.writeFile(resolve('dist/llms.txt'), buildLlms(snapshot), 'utf8'),
  ]);

  const repoChecks = snapshot.repos.slice(0, 3).map((repo) => `${repo.owner}/${repo.name}`);
  for (const name of repoChecks) {
    if (!output.includes(name)) {
      throw new Error(`Prerendered HTML is missing ${name}`);
    }
  }

  console.log(
    `Prerendered ${snapshot.repos.length} repositories at ${snapshot.date} (${markup.length} bytes of HTML).`
  );
}

main().catch((error) => {
  console.error(`Prerender failed: ${error.message}`);
  process.exitCode = 1;
});
