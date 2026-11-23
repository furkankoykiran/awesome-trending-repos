/**
 * History helpers shared by the daily update and the one-off rebuild script.
 *
 * The raw `.data/snapshots/*.json` files are the source of truth: one file per
 * day, kept forever. `.data/history.json` is a derived index and
 * `public/data/history.json` is the compact, chart-friendly version the
 * dashboard fetches. Keeping the three in sync in one module avoids the daily
 * job and the rebuild script drifting apart.
 */

import { generateInsights } from './utils.js';

const DAY_MS = 24 * 60 * 60 * 1000;

export const dayOf = (isoDate) => new Date(isoDate).toISOString().slice(0, 10);

/** Build a history entry ({ date, repos, insights }) for a snapshot. */
export function createHistoryEntry(repos, date = new Date()) {
  const insights = generateInsights(repos);
  return {
    date: new Date(date).toISOString(),
    repos,
    insights: {
      risingStar: insights.risingStar,
      topLanguages: insights.topLanguages,
      totalStars: insights.totalStars,
    },
  };
}

/** Newest first, one entry per day, so a re-run on the same day replaces it. */
export function mergeHistoryEntry(snapshots, entry) {
  const day = dayOf(entry.date);
  const withoutDay = snapshots.filter((item) => dayOf(item.date) !== day);
  return [entry, ...withoutDay].sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
}

/**
 * Compact history for the browser: a daily aggregate series plus the star
 * trajectory of the repositories that appeared most often. Dates are aligned
 * into a single timeline so a chart can draw several lines without gaps.
 */
export function buildPublicHistory(snapshots, { topRepos = 6 } = {}) {
  const ordered = [...snapshots]
    .filter((entry) => entry && Array.isArray(entry.repos) && entry.repos.length > 0)
    .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  if (ordered.length === 0) {
    return {
      generatedAt: new Date().toISOString(),
      firstDate: null,
      lastDate: null,
      days: 0,
      uniqueRepos: 0,
      latestTotalStars: 0,
      series: [],
      topRepos: [],
      timeline: [],
    };
  }

  const tracked = new Map();
  const series = ordered.map((entry) => {
    const date = dayOf(entry.date);
    const insights = entry.insights || generateInsights(entry.repos);
    const totalStars = entry.repos.reduce((sum, repo) => sum + (repo.stars || 0), 0);
    const totalGrowth = entry.repos.reduce((sum, repo) => sum + (repo.starsToday || 0), 0);

    for (const repo of entry.repos) {
      const key = `${repo.owner}/${repo.name}`;
      let record = tracked.get(key);
      if (!record) {
        record = {
          key,
          owner: repo.owner,
          name: repo.name,
          language: repo.language || 'Unknown',
          appearances: 0,
          firstDate: date,
          lastDate: date,
          points: [],
        };
        tracked.set(key, record);
      }
      record.appearances += 1;
      record.lastDate = date;
      record.language = repo.language || record.language;
      record.points.push({ date, stars: repo.stars || 0 });
    }

    return {
      date,
      repos: entry.repos.length,
      totalStars,
      totalGrowth,
      topLanguage: insights.topLanguages?.[0]?.language ?? null,
    };
  });

  const leaders = [...tracked.values()]
    .sort((a, b) => {
      if (b.appearances !== a.appearances) return b.appearances - a.appearances;
      return b.points[b.points.length - 1].stars - a.points[a.points.length - 1].stars;
    })
    .slice(0, topRepos)
    .map((record) => ({
      key: record.key,
      owner: record.owner,
      name: record.name,
      language: record.language,
      appearances: record.appearances,
      firstDate: record.firstDate,
      lastDate: record.lastDate,
      starsFirst: record.points[0].stars,
      starsLast: record.points[record.points.length - 1].stars,
      starGrowth: record.points[record.points.length - 1].stars - record.points[0].stars,
      points: record.points,
    }));

  // Align each tracked repository onto one row per day for recharts.
  const timeline = ordered.map((entry) => {
    const date = dayOf(entry.date);
    const row = { date };
    for (const leader of leaders) {
      const point = leader.points.find((item) => item.date === date);
      row[leader.key] = point ? point.stars : null;
    }
    return row;
  });

  const first = Date.parse(ordered[0].date);
  const last = Date.parse(ordered[ordered.length - 1].date);

  return {
    generatedAt: new Date().toISOString(),
    firstDate: dayOf(ordered[0].date),
    lastDate: dayOf(ordered[ordered.length - 1].date),
    days: Math.round((last - first) / DAY_MS) + 1,
    uniqueRepos: tracked.size,
    latestTotalStars: series[series.length - 1].totalStars,
    series,
    topRepos: leaders,
    timeline,
  };
}

/** Newest-first deployment feed derived from the same snapshots. */
export function buildFeed(snapshots, limit = 20) {
  return [...snapshots]
    .filter((entry) => entry && Array.isArray(entry.repos) && entry.repos.length > 0)
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    .slice(0, limit)
    .map((entry) => {
      const insights = entry.insights || generateInsights(entry.repos);
      const languages = (insights.topLanguages || []).map((item) => item.language).join(', ');
      return {
        id: String(Date.parse(entry.date)),
        date: entry.date,
        title: `Daily Update: ${entry.repos.length} repos curated`,
        summary: `Top languages today: ${languages}. Rising star: ${insights.risingStar?.name ?? 'n/a'}.`,
        type: 'update',
      };
    });
}
