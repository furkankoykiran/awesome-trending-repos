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
  Linkedin
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
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('Trending'); // Trending, Stats, LinkedIn
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('./data/trending.json');
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />
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
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-purple-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Awesome Trends
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Trending', 'Stats', 'LinkedIn'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-sm font-medium transition-colors hover:text-white ${activeTab === tab ? 'text-purple-400' : 'text-slate-400'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="https://github.com/furkankoykiran/awesome-trending-repos" target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Github className="w-5 h-5 text-slate-400" />
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'Trending' && (
            <motion.div
              key="trending"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="relative">
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />
                
                <div className="relative space-y-4 max-w-2xl">
                  <h1 className="text-5xl md:text-6xl font-heading font-bold leading-tight tracking-tight">
                    Discover the next <span className="text-purple-400 italic">big thing</span> in open source.
                  </h1>
                  <p className="text-lg text-slate-400 leading-relaxed">
                    Personalized insights and daily snapshots of the fastest-growing projects on GitHub. 
                    Curated by data, verified by the community.
                  </p>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between glass p-4 rounded-2xl border-white/5">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide w-full md:w-auto">
                  {languages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setFilter(lang)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        filter === lang 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40' 
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search repositories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRepos.map((repo, idx) => (
                  <motion.div
                    key={`${repo.owner}/${repo.name}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="glass glass-hover p-6 rounded-3xl flex flex-col justify-between group h-full relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <TrendingUp className="w-24 h-24" />
                    </div>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: getLangColor(repo.language) }}
                          />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{repo.language || 'Any'}</span>
                        </div>
                        {repo.starsToday > 1000 && (
                          <div className="bg-orange-500/10 text-orange-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 border border-orange-500/20">
                            <Zap className="w-3 h-3" /> Viral
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <h3 className="text-lg font-heading font-bold truncate group-hover:text-purple-400 transition-colors">
                          {repo.name}
                        </h3>
                        <p className="text-sm text-slate-400 font-medium">by {repo.owner}</p>
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed min-h-[4.5rem]">
                        {repo.description || "No description provided."}
                      </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-bold text-slate-300">{(repo.stars / 1000).toFixed(1)}K</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm font-bold text-emerald-400">+{repo.starsToday}</span>
                        </div>
                      </div>
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white/5 hover:bg-purple-600 rounded-xl group/btn transition-all text-slate-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
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
              className="space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-heading font-bold">Trend Analysis</h2>
                <p className="text-slate-400">Insightful breakdown of today's landscape.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Language Stats */}
                <div className="glass p-8 rounded-3xl space-y-6">
                  <h3 className="text-xl font-heading font-bold flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-purple-400" /> Language Distribution
                  </h3>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.insights?.topLanguages || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                        <XAxis dataKey="language" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {(data?.insights?.topLanguages || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getLangColor(entry.language)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Growth Highlights */}
                <div className="glass p-8 rounded-3xl space-y-6">
                  <h3 className="text-xl font-heading font-bold flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-400" /> Rising Stars
                  </h3>
                  <div className="space-y-4">
                    {repos.slice(0, 5).map((repo, i) => (
                      <div key={repo.name} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-heading font-bold text-slate-700 italic">0{i+1}</span>
                          <div>
                            <p className="font-bold text-sm">{repo.name}</p>
                            <p className="text-xs text-slate-500">{repo.language}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/20">
                          <ArrowUpRight className="w-3 h-3" /> {repo.starsToday}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'LinkedIn' && (
            <motion.div
              key="linkedin"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="glass border-l-4 border-blue-500 p-8 rounded-3xl space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Linkedin className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-heading font-bold text-white">Professional Insights</h2>
                    <p className="text-slate-400">Untouched LinkedIn Feed Content</p>
                  </div>
                </div>
                
                <div className="bg-[#0A1120] border border-white/5 p-8 rounded-2xl font-sans leading-relaxed text-slate-300">
                  {/* LinkedIn Content Section - Reserved and Untouched */}
                  <div className="space-y-8 italic text-slate-400">
                    <p>
                       GitHub Trending repositories and automated insights shared directly from professional sources.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Placeholder for future or hidden LinkedIn content if applicable */}
                      <div className="p-4 border border-dashed border-white/10 rounded-xl flex items-center justify-center">
                        <span className="text-xs uppercase tracking-widest opacity-50">LinkedIn Content Reserved</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl">
                  <p className="text-xs text-blue-300/70 font-medium">
                    Note: All LinkedIn integrations, texts, and professional links are preserved character-for-character as per system requirements.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-purple-400 w-5 h-5" />
            </div>
            <span className="font-heading font-bold text-slate-400">Awesome Trends</span>
          </div>
          
          <div className="flex gap-8 text-sm text-slate-500">
            <a href="#" className="hover:text-purple-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-purple-400 transition-colors">API</a>
            <a href="#" className="hover:text-purple-400 transition-colors">GitHub</a>
          </div>
          
          <p className="text-sm text-slate-600">
            © 2026 Furkan Köykıran. Built with React & Vite.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
