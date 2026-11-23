import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildFeed, buildPublicHistory, createHistoryEntry, mergeHistoryEntry } from '../scripts/history.js';

const repo = (name, stars, extra = {}) => ({
  owner: 'acme',
  name,
  stars,
  starsToday: 10,
  language: 'TypeScript',
  url: `https://github.com/acme/${name}`,
  ...extra,
});

test('mergeHistoryEntry keeps one entry per day and sorts newest first', () => {
  const older = createHistoryEntry([repo('alpha', 100)], '2026-03-17T10:00:00.000Z');
  const sameDay = createHistoryEntry([repo('beta', 200)], '2026-03-17T23:00:00.000Z');
  const newer = createHistoryEntry([repo('gamma', 300)], '2026-03-18T10:00:00.000Z');

  const merged = mergeHistoryEntry([older, newer], sameDay);

  assert.equal(merged.length, 2, 'the same day must be replaced, not appended');
  assert.deepEqual(
    merged.map((entry) => entry.date),
    ['2026-03-18T10:00:00.000Z', '2026-03-17T23:00:00.000Z']
  );
});

test('buildPublicHistory produces one row per day and tracks star trajectories', () => {
  const history = buildPublicHistory([
    createHistoryEntry([repo('alpha', 100), repo('beta', 50)], '2026-03-17T10:00:00.000Z'),
    createHistoryEntry([repo('alpha', 150)], '2026-03-18T10:00:00.000Z'),
    createHistoryEntry([repo('alpha', 220)], '2026-03-19T10:00:00.000Z'),
  ]);

  assert.equal(history.days, 3);
  assert.equal(history.firstDate, '2026-03-17');
  assert.equal(history.lastDate, '2026-03-19');
  assert.equal(history.series.length, 3);
  assert.equal(history.uniqueRepos, 2);
  assert.equal(history.latestTotalStars, 220);

  const alpha = history.topRepos.find((item) => item.key === 'acme/alpha');
  assert.ok(alpha, 'alpha must be tracked');
  assert.equal(alpha.appearances, 3);
  assert.equal(alpha.starsFirst, 100);
  assert.equal(alpha.starsLast, 220);
  assert.equal(alpha.starGrowth, 120);

  assert.deepEqual(
    history.timeline.map((row) => row['acme/alpha']),
    [100, 150, 220]
  );
});

test('buildFeed is newest first and bounded', () => {
  const snapshots = Array.from({ length: 30 }, (_, index) =>
    createHistoryEntry([repo(`r${index}`, 100 + index)], `2026-03-${String((index % 28) + 1).padStart(2, '0')}T10:00:00.000Z`)
  );

  const feed = buildFeed(snapshots, 20);

  assert.equal(feed.length, 20);
  const dates = feed.map((entry) => Date.parse(entry.date));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a));
});
