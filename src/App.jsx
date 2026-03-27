import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Star, 
  GitFork, 
  Github, 
  ExternalLink, 
  PieChart, 
  Code2, 
  Zap,
  Globe,
  Search,
  Filter,
  ArrowUpRight,
  TrendingDown,
  ChevronRight,
  Bell,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// --- Utility for color tokens ---
const getLangColor = (lang) => {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Go': '#00ADD8',
    'Rust': '#dea584',
    'Shell': '#89e051',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'C++': '#f34b7d',
    'Java': '#b07219'
  };
  return colors[lang] || '#94a3b8';
};

const App = () => {
  const [data, setData] = useState(null);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Trending'); // Trending, Stats, Feed
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-brand-primary/30">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/10 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 relative">
              <img src="./logo.png" alt="Logo" className="w-full h-full object-contain animate-float" />
            </div>
            <span className="text-2xl font-heading font-bold tracking-tight text-gradient">
              Awesome Trends
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
            {['Trending', 'Stats', 'Feed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab 
                  ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/furkankoykiran/awesome-trending-repos" target="_blank" rel="noopener noreferrer" className="p-3 glass-card rounded-xl group transition-all">
              <Github className="w-5 h-5 text-slate-400 group-hover:text-white" />
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'Trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="relative py-10">
                <div className="space-y-6 max-w-3xl">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
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
                      onClick={() => setFilter(lang)}
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-brand-primary transition-colors" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-[1.5rem] py-3.5 pl-12 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/20 focus:border-brand-primary/40 transition-all font-medium"
                  />
                </div>
              </div>

              {/* Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRepos.map((repo, idx) => (
                  <motion.div
                    key={`${repo.owner}/${repo.name}`}
                    initial={{ opacity: 0, y: 30 }}
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
                          <span className="text-lg font-black text-white">{(repo.stars / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="w-px h-8 bg-white/5" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Growth</span>
                          </div>
                          <span className="text-lg font-black text-emerald-400">+{repo.starsToday}</span>
                        </div>
                      </div>
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-brand-primary rounded-2xl group/btn transition-all text-slate-400 hover:text-white border border-white/5 hover:border-brand-primary/50 shadow-lg hover:shadow-brand-primary/20"
                      >
                        <ExternalLink className="w-5 h-5 transition-transform group-hover/btn:scale-110" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'Stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="space-y-12"
            >
              <div className="space-y-3">
                <h2 className="text-5xl font-heading font-black tracking-tight text-gradient">Visual Insights</h2>
                <p className="text-xl text-slate-400 font-medium">Deep dive into the architecture of today's trends.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* Language Stats */}
                <div className="glass p-10 rounded-[2.5rem] space-y-8 border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <Code2 className="w-7 h-7 text-brand-primary" /> Language Dominance
                    </h3>
                    <div className="px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase">Top 10</div>
                  </div>
                  <div className="h-96 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.insights?.topLanguages || []} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="8 8" stroke="#ffffff03" vertical={false} />
                        <XAxis dataKey="language" stroke="#475569" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} fontWeight={700} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', backdropFilter: 'blur(12px)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
                          itemStyle={{ fontWeight: 'bold' }}
                          cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        />
                        <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={40}>
                          {(data?.insights?.topLanguages || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getLangColor(entry.language)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Growth Highlights */}
                <div className="glass p-10 rounded-[2.5rem] space-y-8 border-white/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-heading font-bold flex items-center gap-3">
                      <TrendingUp className="w-7 h-7 text-emerald-500" /> Velocity Leaders
                    </h3>
                    <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">Growth</div>
                  </div>
                  <div className="space-y-4">
                    {repos.slice(0, 6).map((repo, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={repo.name} 
                        className="flex items-center justify-between p-6 bg-white/5 rounded-[1.5rem] hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/5 group"
                      >
                        <div className="flex items-center gap-5">
                          <span className="text-3xl font-heading font-black text-slate-800 italic group-hover:text-brand-primary transition-colors">{(i+1).toString().padStart(2, '0')}</span>
                          <div>
                            <p className="font-bold text-base tracking-tight">{repo.name}</p>
                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">{repo.language}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-2xl text-xs font-black border border-emerald-500/10">
                          <TrendingUp className="w-3.5 h-3.5" /> {repo.starsToday}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'Feed' && (
            <motion.div
              key="feed"
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
                      initial={{ opacity: 0, scale: 0.95 }}
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
                          <span className="text-xs font-black uppercase tracking-[0.2em] px-4 py-2 bg-white/5 rounded-full text-slate-500 border border-white/5">
                            {new Date(item.date).toLocaleDateString(undefined, { 
                              month: 'long', 
                              day: 'numeric', 
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
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

      <footer className="border-t border-white/5 py-20 px-6 relative overflow-hidden bg-brand-surface/30">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-4">
              <img src="./logo.png" alt="Logo" className="w-10 h-10" />
              <span className="text-2xl font-heading font-black tracking-tighter text-gradient">Awesome Trends</span>
            </div>
            <p className="text-slate-400 font-medium max-w-md leading-relaxed">
              Tracking the exponential growth of open source software through automated signals, 
              sentiment analysis, and historical trajectory.
            </p>
            <div className="flex gap-4">
               <a href="#" className="p-3 glass rounded-xl hover:bg-white/5 transition-all">
                <Github className="w-5 h-5 text-slate-400" />
               </a>
               <a href="#" className="p-3 glass rounded-xl hover:bg-white/5 transition-all">
                <Globe className="w-5 h-5 text-slate-400" />
               </a>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Navigation</h4>
            <div className="flex flex-col gap-4 text-sm font-bold text-slate-400">
              <button onClick={() => setActiveTab('Trending')} className="text-left hover:text-brand-primary transition-colors">Trending Now</button>
              <button onClick={() => setActiveTab('Stats')} className="text-left hover:text-brand-primary transition-colors">Visual Stats</button>
              <button onClick={() => setActiveTab('Feed')} className="text-left hover:text-brand-primary transition-colors">Deployment Feed</button>
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
  );
};

export default App;
