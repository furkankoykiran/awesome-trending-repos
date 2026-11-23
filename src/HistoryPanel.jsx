import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Calendar, Github, History, Star, TrendingUp } from 'lucide-react';
import { formatCount } from './lib/format.js';

const shortDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * Long-term history lives in its own chunk: it pulls recharts just like the
 * Stats tab, so keeping it out of the initial bundle matters.
 *
 * The data comes from public/data/history.json, which scripts/history.js builds
 * from every retained daily snapshot in .data/snapshots/.
 */
export default function HistoryPanel({ history, initialData }) {
  const series = Array.isArray(history?.series) ? history.series : [];
  const topRepos = Array.isArray(history?.topRepos) ? history.topRepos : [];

  if (series.length === 0) {
    return (
      <motion.div
        key="history"
        role="tabpanel"
        id="panel-History"
        aria-labelledby="tab-History"
        initial={initialData ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-12 rounded-[2.5rem] border-dashed border-2 border-white/5 flex flex-col items-center justify-center text-center space-y-6"
      >
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center">
          <History className="w-10 h-10 text-slate-600" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">History is still building</h2>
          <p className="text-slate-500 font-medium max-w-md">
            The first snapshots are being collected. Star trajectories and the
            full archive appear here once there is more than one day of data.
          </p>
        </div>
      </motion.div>
    );
  }

  const latest = series[series.length - 1];
  const stats = [
    { label: 'Days tracked', value: formatCount(history.days || series.length), icon: Calendar },
    { label: 'Repositories seen', value: formatCount(history.uniqueRepos || 0), icon: Github },
    { label: 'Stars in view', value: formatCount(latest.totalStars || 0), icon: Star },
    { label: 'Growth today', value: `+${formatCount(latest.totalGrowth || 0)}`, icon: TrendingUp },
  ];

  return (
    <motion.div
      key="history"
      role="tabpanel"
      id="panel-History"
      aria-labelledby="tab-History"
      initial={initialData ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      className="space-y-12"
    >
      <div className="space-y-3">
        <h2 className="text-5xl font-heading font-black tracking-tight text-gradient">
          The Long View
        </h2>
        <p className="text-xl text-slate-400 font-medium max-w-3xl">
          Every daily snapshot since {shortDate(history.firstDate)}, kept in the
          repository. {formatCount(series.length)} days of star trajectories
          across {formatCount(history.uniqueRepos || 0)} repositories.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-card p-6 rounded-[1.75rem] space-y-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className="text-3xl font-heading font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6" aria-labelledby="history-stars-title">
        <div className="space-y-1">
          <h3 id="history-stars-title" className="text-2xl font-heading font-bold">
            Total stars across tracked repositories
          </h3>
          <p className="text-sm text-slate-500 font-medium">
            {shortDate(history.firstDate)} – {shortDate(history.lastDate)}
          </p>
        </div>
        <div className="h-80 w-full" role="img" aria-label={`Total stars grew from ${formatCount(series[0].totalStars)} to ${formatCount(latest.totalStars)} over ${series.length} days`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="historyStarsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="date" tickFormatter={shortDate} stroke="#64748b" fontSize={12} minTickGap={40} />
              <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCount} width={60} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                formatter={(value) => [formatCount(value), 'Total stars']}
              />
              <Area type="monotone" dataKey="totalStars" stroke="#a78bfa" strokeWidth={2} fill="url(#historyStarsFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6" aria-labelledby="history-growth-title">
          <div className="space-y-1">
            <h3 id="history-growth-title" className="text-2xl font-heading font-bold">
              Daily star growth
            </h3>
            <p className="text-sm text-slate-500 font-medium">Combined growth of the top 25 repositories.</p>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="date" tickFormatter={shortDate} stroke="#64748b" fontSize={12} minTickGap={40} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={formatCount} width={60} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16 }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  formatter={(value) => [`+${formatCount(value)}`, 'Stars today']}
                />
                <Bar dataKey="totalGrowth" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6" aria-labelledby="history-repos-title">
          <div className="space-y-1">
            <h3 id="history-repos-title" className="text-2xl font-heading font-bold">
              Most consistent repositories
            </h3>
            <p className="text-sm text-slate-500 font-medium">Ranked by days on the trending list.</p>
          </div>
          <ol className="space-y-3">
            {topRepos.map((repo, index) => (
              <li key={repo.key} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                <span className="w-8 text-center text-sm font-black text-slate-500">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`https://github.com/${repo.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-bold text-white hover:text-brand-primary transition-colors"
                  >
                    {repo.key}
                  </a>
                  <p className="text-xs text-slate-500 font-semibold">
                    {repo.appearances} {repo.appearances === 1 ? 'day' : 'days'} · {repo.language}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-emerald-400">+{formatCount(repo.starGrowth)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {formatCount(repo.starsLast)} stars
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="text-sm text-slate-500 font-medium">
        Raw archive: <code className="text-slate-400">.data/snapshots/</code> in the repository, one JSON file per day.
        Machine-readable history: <a className="text-brand-primary hover:underline" href="./data/history.json">data/history.json</a>.
      </p>
    </motion.div>
  );
}
