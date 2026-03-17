# Awesome Trending Repos

<div align="center">

![Awesome](https://img.shields.io/badge/awesome-list-brightgreen?style=for-the-badge)
![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-auto--updated-blue?style=for-the-badge&logo=githubactions)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)

**A daily-updated, auto-curated list of the most awesome trending open-source repositories.**

Enriched with deep insights and historical data, powered by GitHub Actions.

[![Update Trends](https://github.com/furkankoykiran/awesome-trending-repos/actions/workflows/update-trends.yml/badge.svg)](https://github.com/furkankoykiran/awesome-trending-repos/actions/workflows/update-trends.yml)

</div>

---

## Overview

This project automatically tracks and curates the most trending open-source repositories from GitHub. Every day at midnight UTC, it fetches the latest trending data, enriches it with insights like growth metrics and language distribution, and updates this README automatically.

### Features

| Feature | Description |
|---------|-------------|
| **Daily Updates** | Automatically refreshed every day at 00:00 UTC via GitHub Actions |
| **Multi-Language** | Tracks repos across JavaScript, TypeScript, Python, Go, Rust, Java, and more |
| **Growth Tracking** | Shows 24-hour star growth for each repository |
| **Language Insights** | Groups trending repos by programming language |
| **Rising Stars** | Highlights the fastest growing repositories |
| **Historical Comparison** | Compares with previous data to show new entrants, rank changes, and trends |
| **Visual Graphs** | ASCII bar charts and trend visualizations |
| **Data Persistence** | Stores 7 days of historical snapshots |

## How It Works

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  GitHub Actions │───▶│   Node.js Script │───▶│   README.md     │
│  (daily cron)   │    │   (update.js)    │    │   (auto-updated)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Data Sources    │
                       │  • GitHub        │
                       │  • GitHub Search │
                       └──────────────────┘
```

### Data Pipeline

1. **Fetch**: Scrape GitHub's trending page for real-time data
2. **Store**: Save daily snapshots for historical comparison
3. **Compare**: Analyze changes vs previous data (new entrants, rank changes, trends)
4. **Generate**: Create formatted Markdown tables with insights and graphs
5. **Commit**: Auto-commit changes back to repository

<!-- START_TRENDING -->
## 📈 Today's Trending Repositories

> _Last updated: **Tue, 17 Mar 2026 09:59:22 GMT** | Data source: **GitHub Trending** | Repositories: **11**

| Rank | Repository | Stars | Language | 24h Growth | Description |
|------|------------|-------|----------|------------|-------------|
| 1 | [666ghj/MiroFish](https://github.com/666ghj/MiroFish) | 31.4K | ![](https://img.shields.io/badge/Python-3572A5?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +3.3K ⭐ | A Simple and Universal Swarm Intelligence Engine, Predicting |
| 2 | [obra/superpowers](https://github.com/obra/superpowers) | 90.2K | ![](https://img.shields.io/badge/Shell-89e051?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +3.2K ⭐ | An agentic skills framework & software development methodolo |
| 3 | [volcengine/OpenViking](https://github.com/volcengine/OpenViking) | 14.7K | ![](https://img.shields.io/badge/Python-3572A5?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +2.0K ⭐ | OpenViking is an open-source context database designed speci |
| 4 | [abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus) | 16.0K | ![](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +1.9K ⭐ | GitNexus: The Zero-Server Code Intelligence Engine - GitNexu |
| 5 | [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) | 29.9K | ![](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +1.5K ⭐ | Bash is all you need - A nano Claude Code–like agent, built  |
| 6 | [thedotmack/claude-mem](https://github.com/thedotmack/claude-mem) | 37.3K | ![](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +1.0K ⭐ | A Claude Code plugin that automatically captures everything  |
| 7 | [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) | 13.4K | ![](https://img.shields.io/badge/Python-3572A5?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +1.0K ⭐ | Agent harness built with LangChain and LangGraph. Equipped w |
| 8 | [p-e-w/heretic](https://github.com/p-e-w/heretic) | 15.5K | ![](https://img.shields.io/badge/Python-3572A5?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +788 ⭐ | Fully automatic censorship removal for language models |
| 9 | [Crosstalk-Solutions/project-nomad](https://github.com/Crosstalk-Solutions/project-nomad) | 2.1K | ![](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +775 ⭐ | Project N.O.M.A.D, is a self-contained, offline survival com |
| 10 | [voidzero-dev/vite-plus](https://github.com/voidzero-dev/vite-plus) | 2.4K | ![](https://img.shields.io/badge/Rust-dea584?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +621 ⭐ | Vite+ is the unified toolchain and entry point for web devel |
| 11 | [YishenTu/claudian](https://github.com/YishenTu/claudian) | 4.4K | ![](https://img.shields.io/badge/TypeScript-3178c6?style=flat-square&logo=data:image/svg%2bxml;base64,PHN2ZyB3aWR0aD0iMTYiIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNiAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNOCAwQzMuNTggMCAwIDMuNTggMCA4QzAgMTIuNDIgMy41OCAxNiA4IDE2QzEyLjQyIDE2IDE2IDEyLjQyIDE2IDhDMTYgMy41OCAxMi40MiAwIDggMFpNOCAxNEMzLjY4IDE0IDEgMTEuMzIgMSA4QzEgNC42OCAzLjY4IDIgOCAyQzExLjMyIDIgMTQgNC42OCAxNCA4QzE0IDExLjMyIDExLjMyIDE0IDggMTRaIiBmaWxsPSIjZmZmIi8+PC9zdmc+) | +111 ⭐ | An Obsidian plugin that embeds Claude Code as an AI collabor |


### 🔄 Changes Since Last Update


### 📊 Trend Analysis

**🔥 Hottest Today (by star growth):**

🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 [+3.3K] [666ghj/MiroFish](https://github.com/666ghj/MiroFish)
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 [+3.2K] [obra/superpowers](https://github.com/obra/superpowers)
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 [+2.0K] [volcengine/OpenViking](https://github.com/volcengine/OpenViking)
🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 [+1.9K] [abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus)
🔥🔥🔥🔥🔥🔥🔥🔥🔥▪ [+1.5K] [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code)

**📈 Language Trend Changes:**

➡️ **Python**: 4 repos (0, 36.4%)
➡️ **Shell**: 1 repos (0, 9.1%)
➡️ **TypeScript**: 5 repos (0, 45.5%)
➡️ **Rust**: 1 repos (0, 9.1%)

**🏆 Consistent Performers** (appearing in multiple recent updates):

⭐ [666ghj/MiroFish](https://github.com/666ghj/MiroFish) - 2/2 updates (100%)
⭐ [obra/superpowers](https://github.com/obra/superpowers) - 2/2 updates (100%)
⭐ [volcengine/OpenViking](https://github.com/volcengine/OpenViking) - 2/2 updates (100%)
⭐ [abhigyanpatwari/GitNexus](https://github.com/abhigyanpatwari/GitNexus) - 2/2 updates (100%)
⭐ [shareAI-lab/learn-claude-code](https://github.com/shareAI-lab/learn-claude-code) - 2/2 updates (100%)


### 📊 Insights

* **Rising Star**: [obra/superpowers](https://github.com/obra/superpowers) with +90.2K stars
* **Top Languages**: 1. TypeScript (5), 2. Python (4), 3. Shell (1), 4. Rust (1)
* **New Entrants Today**: 11
* **Total Stars Tracked**: 257.3K
### 🏷️ Language Distribution

```
TypeScript      ███████████████████████ 5 (45.5%)
Python          ██████████████████ 4 (36.4%)
Shell           █████ 1 (9.1%)
Rust            █████ 1 (9.1%)
```

<!-- END_TRENDING -->

---

## Setup & Usage

### Local Development

```bash
# Install dependencies
npm install

# Run update script manually
npm run update

# Run in dry-run mode (for testing)
npm test
```

### GitHub Actions Setup

1. Fork or clone this repository
2. Enable GitHub Actions in your repository settings
3. The `GITHUB_TOKEN` is automatically provided by GitHub Actions for authentication

### Manual Workflow Trigger

You can manually trigger the update workflow:

1. Go to the **Actions** tab
2. Select **"Update Trends"** workflow
3. Click **"Run workflow"**

## Project Structure

```
awesome-trending-repos/
├── .github/
│   └── workflows/
│       └── update-trends.yml    # Daily cron + manual trigger
├── .data/
│   ├── history.json             # Historical data summary
│   └── snapshots/               # Daily data snapshots
├── src/
│   ├── data-sources/
│   │   ├── github-trending.js   # GitHub trending page scraper
│   │   └── github-search.js     # GitHub Search API fallback
│   ├── utils/
│   │   ├── markdown.js          # Markdown generation utilities
│   │   ├── insights.js          # Data analysis and enrichment
│   │   └── readme.js            # README update logic
│   └── update.js                # Main entry point
├── package.json
└── README.md
```

## Configuration

Edit `src/update.js` to customize behavior:

| Option | Default | Description |
|--------|---------|-------------|
| `maxRepos` | 50 | Maximum repositories to display |
| `filterLanguages` | true | Filter to popular programming languages |
| `includeInsights` | true | Include insights section |
| `includeLanguageBreakdown` | true | Include language distribution chart |

## Contributing

Contributions are welcome! Areas for improvement:

- **Data Sources**: Add new data sources (GitLab, Bitbucket, etc.)
- **Insights**: Add more analytics (fork growth, issue activity, etc.)
- **UI**: Improve visualization with charts and graphs
- **Filters**: Add category/topic-based filtering

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**Built with ❤️ using Node.js and GitHub Actions**

[⭐ Star this repo](https://github.com/furkankoykiran/awesome-trending-repos) •
[🐛 Report issues](https://github.com/furkankoykiran/awesome-trending-repos/issues) •
[💡 Suggest features](https://github.com/furkankoykiran/awesome-trending-repos/issues/new)

</div>
