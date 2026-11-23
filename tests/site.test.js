import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const SITE_URL = 'https://furkankoykiran.com.tr/awesome-trending-repos/';

test('document head carries canonical, social and discovery metadata', async () => {
  const html = await readFile('index.html', 'utf8');

  assert.match(html, /<html lang="en">/, 'document language must be English');
  assert.match(html, /<title>[^<]+<\/title>/, 'title is required');
  assert.match(html, /name="description"[\s\S]*?content="[^"]{50,}"/, 'description is required');
  assert.match(html, new RegExp(`rel="canonical" href="${SITE_URL}"`), 'canonical must use the public URL');
  assert.match(html, /property="og:image" content="https:\/\/furkankoykiran\.com\.tr\/awesome-trending-repos\/og-image\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /%BASE_URL%favicon\.png/, 'icons must respect the GitHub Pages base path');
  assert.match(html, /%BASE_URL%manifest\.webmanifest/);
  assert.doesNotMatch(html, /href="\/og-image\.png"/, 'root-absolute assets break under /awesome-trending-repos/');
});

test('machine-readable files exist and point at the canonical sitemap', async () => {
  const [robots, ai, security, manifest] = await Promise.all([
    readFile('public/robots.txt', 'utf8'),
    readFile('public/ai.txt', 'utf8'),
    readFile('public/.well-known/security.txt', 'utf8'),
    readFile('public/manifest.webmanifest', 'utf8'),
  ]);

  assert.match(robots, /^User-agent: \*/m);
  assert.match(robots, new RegExp(`Sitemap: ${SITE_URL}sitemap\\.xml`));
  assert.match(ai, /ai-train=yes/);
  assert.match(security, /^Contact: mailto:/m);
  assert.match(security, /^Canonical: https:/m);
  assert.ok(JSON.parse(manifest).icons.length >= 1, 'manifest needs at least one icon');
});

test('README documents the live demo, the pipeline and the local commands', async () => {
  const readme = await readFile('README.md', 'utf8');

  assert.match(readme, new RegExp(SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(readme, /npm run update/);
  assert.match(readme, /npm run build/);
  assert.match(readme, /prerender/i);
});
