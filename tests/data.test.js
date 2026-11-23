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

test('tracked history stays inside the seven-day window', async () => {
  const history = await readJson('.data/history.json');

  assert.ok(Array.isArray(history.snapshots), 'history.snapshots must be an array');
  assert.ok(history.snapshots.length <= 7, 'history must keep at most seven snapshots');

  const dates = history.snapshots.map((entry) => Date.parse(entry.date));
  assert.deepEqual(dates, [...dates].sort((a, b) => b - a), 'history must be newest first');
});
