<div align="center">

<img src="public/logo.png" alt="Awesome Trending Repos logo" width="160" />

# Awesome Trending Repos

**A daily-updated dashboard of the fastest-growing open-source repositories on GitHub.**

[![CI](https://github.com/furkankoykiran/awesome-trending-repos/actions/workflows/ci.yml/badge.svg)](https://github.com/furkankoykiran/awesome-trending-repos/actions/workflows/ci.yml)
[![Update and Deploy](https://github.com/furkankoykiran/awesome-trending-repos/actions/workflows/update-trends.yml/badge.svg)](https://github.com/furkankoykiran/awesome-trending-repos/actions/workflows/update-trends.yml)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

[Live dashboard](https://furkankoykiran.com.tr/awesome-trending-repos/) ·
[Report an issue](https://github.com/furkankoykiran/awesome-trending-repos/issues)

</div>

---

## Live demo

**[furkankoykiran.com.tr/awesome-trending-repos](https://furkankoykiran.com.tr/awesome-trending-repos/)**

The page is prerendered at build time, so the current snapshot is readable
before JavaScript loads. The client bundle then hydrates the dashboard and takes
over filtering, tabs and charts.

## Features

- **Daily updates** — GitHub Actions refreshes the snapshot every day at midnight UTC and on pushes to `main`.
- **Historical comparison** — new entrants, rank changes and star growth against the previous snapshot.
- **Growth tracking** — stars gained in the last 24 hours for every repository.
- **Language insights** — trending repositories grouped by language, with aggregate star counts.
- **Rising star** — the fastest-growing repository of the day.
- **Seven-day history** — compact snapshots in `.data/`, pruned by filename date.
- **Search and filters** — client-side, no request leaves the page.
- **SEO and AI discovery** — canonical URL, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`, `llms.txt`, `ai.txt` and `.well-known/security.txt`.

## Tech stack

| Layer | Choice |
| --- | --- |
| UI | React 19, Framer Motion, Tailwind CSS 4, Recharts |
| Build | Vite 6 with a React SSR pass for prerendering |
| Data collection | Node.js 24, Octokit, Cheerio |
| Automation | GitHub Actions, GitHub Pages |

## How the data pipeline works

1. `scripts/update.js` scrapes the GitHub Trending page and enriches repositories through the GitHub API.
2. The result is written to `public/data/trending.json`. The latest seven daily snapshots are kept in `.data/snapshots/YYYY-MM-DD.json` and summarised in `.data/history.json`.
3. `public/data/feed.json` receives one entry per run. Both `trending.json` and `feed.json` are committed, so the deployed dashboard and the feed always match.
4. The workflow rebuilds the site and deploys `dist/` to GitHub Pages.

Old snapshots are pruned by the date in the filename, not by file modification
time: a fresh CI checkout resets every mtime, which previously kept 251 files
around. The workflow stages all of `public/data` and `.data`, so `feed.json` is
no longer left behind.

## Local development

Requirements: Node.js 24+.

```bash
npm ci
npm run dev        # Vite dev server
npm test           # data, metadata and README contract tests
npm run build      # client build, SSR build, prerender and output verification
npm run preview    # preview the production build under the Pages base path
npm run update     # fetch a fresh snapshot (needs GITHUB_TOKEN)
```

`GITHUB_TOKEN` is only needed for `npm run update`; the build and tests run
against the committed snapshot.

## Project structure

```text
awesome-trending-repos/
├── .data/                  # Seven-day history and daily snapshots
├── .github/workflows/      # CI and the daily update/deploy pipeline
├── public/                 # Static assets, data and machine-readable files
│   ├── data/               # trending.json and feed.json (committed)
│   └── .well-known/        # security.txt
├── scripts/                # Data collection, prerender and build verification
├── src/                    # React dashboard and SSR entry point
├── tests/                  # node:test data and metadata contracts
├── index.html              # Document head, metadata and no-script fallback
└── vite.config.js          # GitHub Pages base path
```

## Build and prerender

`npm run build` runs three steps:

1. Vite builds the client bundle into `dist/`.
2. Vite builds `src/entry-server.jsx` into `.ssr/`.
3. `scripts/prerender.js` renders the dashboard with the current snapshot,
   embeds the same data for hydration, injects JSON-LD, writes `sitemap.xml` and
   `llms.txt`, and fails if the output is missing repositories.

`scripts/verify-build.js` then checks the prerendered markup, hashed assets,
structured data and machine-readable files. CI runs the same command, so an
empty shell cannot be deployed.

## Data contract

`public/data/trending.json`:

```json
{
  "date": "2026-11-22T04:54:31.479Z",
  "repos": [
    {
      "owner": "owner",
      "name": "repository",
      "description": "Short description",
      "language": "TypeScript",
      "stars": 12345,
      "starsToday": 321,
      "url": "https://github.com/owner/repository"
    }
  ],
  "insights": {
    "topLanguages": [{ "language": "TypeScript", "count": 8, "stars": 100000 }],
    "risingStar": { "owner": "owner", "name": "repository", "growth": 1200 },
    "totalStars": 1000000
  }
}
```

The tests in `tests/data.test.js` enforce this shape, unique repositories and the
seven-day history window.

## Deployment

The `Update and Deploy Trends` workflow builds the site, commits refreshed data
with `[skip ci]`, uploads `dist/` as a Pages artifact and deploys it. The site is
served from `https://furkankoykiran.com.tr/awesome-trending-repos/`; the Vite
`base` and every asset URL use that prefix, so no root-absolute paths are
required.

## Accessibility and performance

- Skip link, landmark regions, labelled search, tab semantics and visible focus styles.
- `prefers-reduced-motion` disables float, gradient and transition animations.
- Images declare width and height; the logo is served at its display size.
- The page remains readable without JavaScript and exposes the snapshot JSON in a `<noscript>` fallback.

## License

Released under the [MIT License](LICENSE) © Furkan Köykıran.

Repository names, descriptions and star counts belong to their respective
projects and are collected from the public GitHub Trending page and the GitHub
REST API.
