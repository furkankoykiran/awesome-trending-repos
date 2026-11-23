import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));

test('trending snapshot has the shape the dashboard expects', async () => {
  const snapshot = await readJson('public/data/trending.json');

  assert.ok(snapshot.date, 'snapshot date is required');
  assert.ok(Number.isFinite(Date.parse(snapshot.date)), 'snapshot date must be ISO-8601');
  assert.ok(Array.isArray(snapshot.repos), 'repos must be an array');
  assert.ok(snapshot.repos.length > 0, 'snapshot must contain at least one repository');
  assert.ok(snapshot.repos.length <= 25, 'snapshot must not exceed the 25-repo cap');

  const seen = new Set();
  for (const repo of snapshot.repos) {
    assert.equal(typeof repo.owner, 'string', 'repo.owner is required');
    assert.equal(typeof repo.name, 'string', 'repo.name is required');
    assert.match(repo.url, /^https:\/\/github\.com\//, 'repo.url must be a GitHub URL');
    assert.ok(Number.isFinite(repo.stars), 'repo.stars must be a number');
    assert.ok(Number.isFinite(repo.starsToday), 'repo.starsToday must be a number');
    assert.ok(repo.starsToday >= 0, 'repo.starsToday must not be negative');

    const fullName = `${repo.owner}/${repo.name}`;
    assert.ok(!seen.has(fullName), `duplicate repository in snapshot: ${fullName}`);
    seen.add(fullName);
  }
});

test('insights are complete enough for the stats tab and feed summary', async () => {
  const snapshot = await readJson('public/data/trending.json');
  const insights = snapshot.insights;

  assert.ok(insights, 'insights are required');
  assert.ok(Array.isArray(insights.topLanguages), 'topLanguages must be an array');
  assert.ok(insights.topLanguages.length > 0, 'topLanguages must not be empty');
  assert.equal(typeof insights.risingStar?.name, 'string', 'risingStar.name is required');
  assert.ok(Number.isFinite(insights.totalStars), 'totalStars must be a number');
});

test('deployment feed is a bounded, newest-first list', async () => {
  const feed = await readJson('public/data/feed.json');

  assert.ok(Array.isArray(feed), 'feed must be an array');
  assert.ok(feed.length <= 20, 'feed must be capped at 20 entries');

  for (const entry of feed) {
    assert.ok(Number.isFinite(Date.parse(entry.date)), 'feed entry date must be ISO-8601');
    assert.equal(typeof entry.title, 'string', 'feed entry title is required');
    assert.equal(typeof entry.summary, 'string', 'feed entry summary is required');
  }

  const dates = feed.map((entry) => Date.parse(entry.date));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a), 'feed must be newest first');
});

test('history keeps every daily snapshot', async () => {
  const history = await readJson('.data/history.json');

  assert.ok(Array.isArray(history.snapshots), 'history.snapshots must be an array');
  assert.ok(history.snapshots.length > 7, 'history must retain more than the old seven-day window');

  const dates = history.snapshots.map((entry) => Date.parse(entry.date));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a), 'history must be newest first');

  const days = new Set(history.snapshots.map((entry) => entry.date.slice(0, 10)));
  assert.equal(days.size, history.snapshots.length, 'history must hold one entry per day');
});

test('public history is a complete, chart-ready series', async () => {
  const history = await readJson('public/data/history.json');

  assert.ok(Number.isFinite(history.days) && history.days > 0, 'days must be a positive number');
  assert.ok(Number.isFinite(Date.parse(history.firstDate)), 'firstDate must be ISO-8601');
  assert.ok(Number.isFinite(Date.parse(history.lastDate)), 'lastDate must be ISO-8601');
  assert.ok(Array.isArray(history.series), 'series must be an array');
  assert.equal(history.series.length, history.days, 'series must have one row per day');
  assert.ok(history.uniqueRepos > 0, 'uniqueRepos must be positive');

  for (const row of history.series) {
    assert.ok(Number.isFinite(Date.parse(row.date)), 'series date must be ISO-8601');
    assert.ok(Number.isFinite(row.totalStars), 'totalStars must be a number');
    assert.ok(Number.isFinite(row.totalGrowth), 'totalGrowth must be a number');
  }

  assert.ok(Array.isArray(history.topRepos) && history.topRepos.length > 0, 'topRepos must not be empty');
  for (const repo of history.topRepos) {
    assert.equal(typeof repo.key, 'string', 'top repo key is required');
    assert.ok(repo.appearances > 0, 'top repo must have at least one appearance');
    assert.ok(Number.isFinite(repo.starGrowth), 'top repo starGrowth must be a number');
  }
});
