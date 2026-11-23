import { motion } from 'framer-motion';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Code2, TrendingUp } from 'lucide-react';
import { formatCount, getLangColor } from './lib/format.js';

/**
 * Charts live in their own chunk: recharts and d3 are only downloaded when
 * someone opens the Stats tab, not on the first paint of the dashboard.
 */
export default function StatsPanel({ data, repos, initialData }) {
  const languages = data?.insights?.topLanguages || [];

  return (
    <motion.div
      key="stats"
      role="tabpanel"
      id="panel-stats"
      aria-labelledby="tab-Stats"
      initial={initialData ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-12"
    >
      <div className="space-y-3">
        <h2 className="text-5xl font-heading font-black tracking-tight text-gradient">Visual Insights</h2>
        <p className="text-xl text-slate-400 font-medium">Deep dive into the architecture of today's trends.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="glass p-10 rounded-[2.5rem] space-y-8 border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-3">
              <Code2 className="w-7 h-7 text-brand-primary" aria-hidden="true" /> Language Dominance
            </h3>
            <div className="px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary text-[10px] font-black uppercase">
              Top 10
            </div>
          </div>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={languages} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="8 8" stroke="#ffffff03" vertical={false} />
                <XAxis
                  dataKey="language"
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#475569"
                  fontSize={11}
                  fontWeight={700}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                />
                <Bar dataKey="count" radius={[12, 12, 0, 0]} barSize={40}>
                  {languages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getLangColor(entry.language)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-10 rounded-[2.5rem] space-y-8 border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-heading font-bold flex items-center gap-3">
              <TrendingUp className="w-7 h-7 text-emerald-500" aria-hidden="true" /> Velocity Leaders
            </h3>
            <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase">
              Growth
            </div>
          </div>
          <div className="space-y-4">
            {repos.slice(0, 6).map((repo, i) => (
              <motion.div
                initial={initialData ? false : { opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={`${repo.owner}/${repo.name}`}
                className="flex items-center justify-between p-6 bg-white/5 rounded-[1.5rem] hover:bg-white/[0.08] transition-all border border-transparent hover:border-white/5 group"
              >
                <div className="flex items-center gap-5">
                  <span className="text-3xl font-heading font-black text-slate-800 italic group-hover:text-brand-primary transition-colors">
                    {(i + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-bold text-base tracking-tight">{repo.name}</p>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">
                      {repo.language}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-2xl text-xs font-black border border-emerald-500/10">
                  <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" /> {formatCount(repo.starsToday)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
