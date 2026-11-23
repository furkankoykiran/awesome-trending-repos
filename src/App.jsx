import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';
import {
  TrendingUp,
  Star,
  Github,
  ExternalLink,
  Zap,
  Globe,
  Search,
  Bell,
  Calendar,
  Layers,
} from 'lucide-react';
import { formatCount, getLangColor } from './lib/format.js';

// Charts pull in recharts and its d3 dependencies, so they live in a separate
// chunk that is only fetched when someone opens the Stats tab.
const StatsPanel = lazy(() => import('./StatsPanel.jsx'));

const TABS = [
  { id: 'Trending', label: 'Trending' },
  { id: 'Stats', label: 'Stats' },
  { id: 'Feed', label: 'Feed' },
];

const App = ({ initialData = null, initialFeed = [] }) => {
  const [data, setData] = useState(initialData);
  const [feed, setFeed] = useState(initialFeed);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Trending'); // Trending, Stats, Feed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialData) return;

    const fetchData = async () => {
      try {
        const [trendingRes, feedRes] = await Promise.all([
          fetch('./data/trending.json'),
          fetch('./data/feed.json').catch(() => ({ json: () => [] }))
        ]);
        
        const trendingJson = await trendingRes.json();
        let feedJson = [];
        try {
          feedJson = await feedRes.json();
        } catch (e) {
          feedJson = [];
        }

        setData(trendingJson);
        setFeed(Array.isArray(feedJson) ? feedJson : []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('The daily snapshot could not be loaded. Please try again in a moment.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [initialData]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] text-slate-200 flex items-center justify-center px-6">
        <div className="glass-card max-w-lg p-10 rounded-[2rem] text-center space-y-4">
          <h1 className="text-3xl font-heading font-black">Snapshot unavailable</h1>
          <p className="text-slate-400 font-medium">{error}</p>
          <a href="./" className="inline-flex px-6 py-3 rounded-2xl bg-brand-primary text-white font-bold">Try again</a>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-brand-primary/10 border-t-brand-primary rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-brand-primary/20 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    );
  }

  const repos = data?.repos || [];
  const filteredRepos = repos.filter(repo => {
    const matchesLang = filter === 'All' || repo.language === filter;
    const matchesSearch = repo.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          repo.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (repo.description && repo.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesLang && matchesSearch;
  });

  const languages = ['All', ...new Set(repos.map(r => r.language).filter(Boolean))];

  return (
    <MotionConfig reducedMotion="user">
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-brand-primary/30">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-xl focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-white focus:font-bold"
      >
        Skip to content
      </a>

      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-4 sm:px-6 py-3 sm:py-4" aria-label="Primary">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <a href="./" className="flex items-center gap-3 group min-w-0" aria-label="Awesome Trending Repos home">
            <span className="w-10 h-10 sm:w-12 sm:h-12 relative shrink-0">
              <img src="./logo.png" width="48" height="48" alt="Awesome Trending Repos" className="w-full h-full object-contain animate-float" />
            </span>
            <span className="hidden sm:inline text-2xl font-heading font-bold tracking-tight text-gradient">
              Awesome Trends
            </span>
          </a>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto" role="tablist" aria-label="Dashboard sections">
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={activeTab === id}
                aria-controls={`panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`px-3 sm:px-6 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeTab === id
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <a
            href="https://github.com/furkankoykiran/awesome-trending-repos"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View the source on GitHub"
            title="View the source on GitHub"
            className="p-3 glass-card rounded-xl group transition-all shrink-0"
          >
            <Github className="w-5 h-5 text-slate-400 group-hover:text-white" aria-hidden="true" />
          </a>
        </div>
      </nav>

      <main id="main-content" tabIndex={-1} className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'Trending' && (
            <motion.div
              key="trending"
              role="tabpanel"
              id="panel-trending"
              aria-labelledby="tab-Trending"
              initial={initialData ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="relative py-10">
                <div className="space-y-6 max-w-3xl">
                  <motion.div 
                    initial={initialData ? false : { opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-xs font-bold uppercase tracking-widest"
                  >
                    <Zap className="w-3.5 h-3.5" /> Curated for Developers
                  </motion.div>
                  <h1 className="text-6xl md:text-7xl font-heading font-black leading-tight tracking-tighter">
                    The <span className="text-gradient">Pulse</span> of Open Source.
                  </h1>
                  <p className="text-xl text-slate-400 leading-relaxed font-medium max-w-2xl">
                    Discover tomorrow's breakout projects today. Real-time insights, 
                    growth tracking, and historical data served in a premium experience.
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between glass p-6 rounded-[2.5rem] border-white/5">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setFilter(lang)}
                      aria-pressed={filter === lang}
                      className={`px-5 py-2.5 rounded-2xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                        filter === lang 
                        ? 'bg-brand-primary text-white shadow-xl shadow-brand-primary/30' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-transparent hover:border-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-80 group">
                  <label htmlFor="repo-search" className="sr-only">Search repositories</label>
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" aria-hidden="true" />
                  <input
                    id="repo-search"
                    type="search"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all font-medium"
                  />
                </div>
              </div>
              <p id="repo-count" className="sr-only" role="status" aria-live="polite">
                {filteredRepos.length} repositories shown
              </p>

              {/* Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRepos.map((repo, idx) => (
                  <motion.div
                    key={`${repo.owner}/${repo.name}`}
                    initial={initialData ? false : { opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, type: "spring", stiffness: 100 }}
                    className="glass-card p-8 rounded-[2rem] flex flex-col justify-between group h-full relative overflow-hidden"
                  >
                    {/* Hover Effect Light */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="space-y-6 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                          <div 
                            className="w-2.5 h-2.5 rounded-full ring-4 ring-white/5 shadow-[0_0_12px_rgba(0,0,0,0.5)]" 
                            style={{ backgroundColor: getLangColor(repo.language) }}
                          />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{repo.language || 'Any'}</span>
                        </div>
                        {repo.starsToday > 1000 && (
                          <div className="bg-brand-accent/20 text-brand-accent text-[10px] font-black px-3 py-1.5 rounded-xl uppercase flex items-center gap-1.5 border border-brand-accent/20 animate-pulse">
                            <Zap className="w-3 h-3 fill-brand-accent" /> Trending
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <h3 className="text-2xl font-heading font-bold truncate group-hover:text-brand-primary transition-colors tracking-tight">
                          {repo.name}
                        </h3>
                        <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5">
                          <Github className="w-3.5 h-3.5" /> {repo.owner}
                        </p>
                      </div>

                      <p className="text-sm text-slate-400 font-medium line-clamp-3 leading-[1.6] min-h-[4.5rem]">
                        {repo.description || "The repository maintainers haven't provided a description for this project yet."}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Star className="w-3.5 h-3.5 text-slate-500" />
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stars</span>
                          </div>
                          <span className="text-lg font-black text-white">{formatCount(repo.stars)}</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Growth</span>
                          </div>
                          <span className="text-lg font-black text-emerald-400">+{Number(repo.starsToday || 0).toLocaleString('en-US')}</span>
                        </div>
                      </div>
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`Open ${repo.owner}/${repo.name} on GitHub`}
                        title={`Open ${repo.owner}/${repo.name} on GitHub`}
                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-brand-primary rounded-2xl group/btn transition-all text-slate-400 hover:text-white border border-white/5 hover:border-brand-primary/50 shadow-lg hover:shadow-brand-primary/20"
                      >
                        <ExternalLink className="w-5 h-5 transition-transform group-hover/btn:scale-110" aria-hidden="true" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'Stats' && (
            <Suspense
              fallback={
                <div
                  className="space-y-12"
                  role="status"
                  aria-live="polite"
                  aria-label="Loading charts"
                >
                  <div className="space-y-3">
                    <h2 className="text-5xl font-heading font-black tracking-tight text-gradient">Visual Insights</h2>
                    <p className="text-xl text-slate-400 font-medium">Loading today's charts…</p>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="glass rounded-[2.5rem] border-white/5 h-96 animate-pulse" />
                    <div className="glass rounded-[2.5rem] border-white/5 h-96 animate-pulse" />
                  </div>
                </div>
              }
            >
              <StatsPanel data={data} repos={repos} initialData={initialData} />
            </Suspense>
          )}

          {activeTab === 'Feed' && (
            <motion.div
              key="feed"
              role="tabpanel"
              id="panel-feed"
              aria-labelledby="tab-Feed"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12 max-w-4xl mx-auto"
            >
              <div className="space-y-3 pb-4">
                <h2 className="text-5xl font-heading font-black tracking-tight text-gradient">Deployment Feed</h2>
                <p className="text-xl text-slate-400 font-medium">Real-time updates and historical deployment events.</p>
              </div>

              <div className="relative space-y-8 before:absolute before:left-[1.75rem] before:top-4 before:bottom-4 before:w-px before:bg-white/10">
                {feed.length > 0 ? (
                  feed.map((item, i) => (
                    <motion.div 
                      key={item.id}
                      initial={initialData ? false : { opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="relative pl-16 group"
                    >
                      {/* Timeline Node */}
                      <div className="absolute left-0 top-1 w-14 h-14 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-2xl bg-[#0F172A] border-2 border-brand-primary/30 flex items-center justify-center group-hover:border-brand-primary group-hover:scale-110 transition-all z-10 shadow-lg shadow-black">
                          {item.type === 'update' ? (
                            <Bell className="w-5 h-5 text-brand-primary" />
                          ) : (
                            <Calendar className="w-5 h-5 text-brand-primary" />
                          )}
                        </div>
                      </div>

                      <div className="glass-card p-8 rounded-[2rem] space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <h3 className="text-2xl font-bold tracking-tight">{item.title}</h3>
                          <time dateTime={item.date} className="text-xs font-black uppercase tracking-[0.2em] px-4 py-2 bg-white/5 rounded-full text-slate-500 border border-white/5">
                            {new Date(item.date).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </time>
                        </div>
                        <p className="text-slate-400 leading-relaxed font-medium text-lg">
                          {item.summary}
                        </p>
                        <div className="pt-2 flex items-center gap-3">
                          <div className="h-1 w-12 bg-brand-primary/30 rounded-full" />
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Autonomous Deployment System</span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="glass p-12 rounded-[2.5rem] border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center space-y-6">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center">
                      <Layers className="w-10 h-10 text-slate-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Waiting for updates</h3>
                      <p className="text-slate-500 font-medium max-w-sm">The deployment feed will start populating after the next scheduled automation run.</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-20 px-6 relative overflow-hidden bg-slate-950/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" aria-hidden="true" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <img src="./logo.png" width="40" height="40" alt="Awesome Trending Repos" className="w-10 h-10" />
              <span className="text-2xl font-heading font-black tracking-tighter text-gradient">Awesome Trends</span>
            </div>
            <p className="text-slate-400 font-medium max-w-md leading-relaxed">
              Tracking the exponential growth of open source software through automated signals, 
              sentiment analysis, and historical trajectory.
            </p>
            <div className="flex gap-4">
               <a href="https://github.com/furkankoykiran/awesome-trending-repos" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository" title="GitHub repository" className="p-3 glass rounded-xl hover:bg-white/5 transition-all">
                <Github className="w-5 h-5 text-slate-400" aria-hidden="true" />
               </a>
               <a href="https://furkankoykiran.com.tr/" aria-label="Furkan Köykıran portfolio" title="Furkan Köykıran portfolio" className="p-3 glass rounded-xl hover:bg-white/5 transition-all">
                <Globe className="w-5 h-5 text-slate-400" aria-hidden="true" />
               </a>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Navigation</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <button type="button" onClick={() => setActiveTab('Trending')} className="text-left hover:text-brand-primary transition-colors">Trending Now</button>
              <button type="button" onClick={() => setActiveTab('Stats')} className="text-left hover:text-brand-primary transition-colors">Visual Stats</button>
              <button type="button" onClick={() => setActiveTab('Feed')} className="text-left hover:text-brand-primary transition-colors">Deployment Feed</button>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">About</h4>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-400">© 2026 Furkan Köykıran</p>
              <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Built with Modern Stack</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </MotionConfig>
  );
};

export default App;
