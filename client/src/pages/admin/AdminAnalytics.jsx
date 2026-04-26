import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminAPI } from '../../services/api';
import { SkeletonCard } from '../../components/common/Skeleton';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics().then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-48"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28" />)}</div>
      <div className="grid lg:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-72 rounded-[16px]" />)}</div>
    </div>
  );

  const statCards = [
    { label: 'Submissions Today', value: data?.submissionsToday || 0, emoji: '📊', bg: 'var(--blue-50)', color: 'var(--blue-700)' },
    { label: 'Acceptance Rate', value: `${data?.acceptanceRate || 0}%`, emoji: '✅', bg: '#dcfce7', color: '#16a34a' },
    { label: 'Total Problems', value: data?.difficultyDist?.reduce((s, d) => s + d.value, 0) || 0, emoji: '💡', bg: '#f3e8ff', color: '#9333ea' },
    { label: 'Top Score', value: data?.topPerformers?.[0]?.progressStats?.totalSolved || 0, emoji: '🏆', bg: '#fef3c7', color: '#d97706' },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>📊 Analytics</h1>
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Platform insights and trends</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
            className="bg-white rounded-[16px] p-5 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>User Signups (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data?.userGrowth || []}>
              <defs><linearGradient id="gBlue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Area type="monotone" dataKey="users" stroke="#6366f1" fill="url(#gBlue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Submission Trends */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Submissions (30 days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={data?.submissionTrends || []}>
              <defs>
                <linearGradient id="gGreen" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} /><stop offset="95%" stopColor="#22c55e" stopOpacity={0} /></linearGradient>
                <linearGradient id="gOrange" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} /><stop offset="95%" stopColor="#f59e0b" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="total" name="Total" stroke="#f59e0b" fill="url(#gOrange)" strokeWidth={2} />
              <Area type="monotone" dataKey="accepted" name="Accepted" stroke="#22c55e" fill="url(#gGreen)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Difficulty Distribution */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Problem Difficulty</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data?.difficultyDist || []} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {(data?.difficultyDist || []).map((_, i) => <Cell key={i} fill={['#22c55e', '#f59e0b', '#ef4444'][i] || COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Language Usage */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Language Usage</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.languageUsage || []} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={60} />
              <Tooltip />
              <Bar dataKey="value" name="Submissions" radius={[0, 6, 6, 0]}>
                {(data?.languageUsage || []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course Popularity */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={9}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Course Popularity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.coursePopularity || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="enrolled" name="Enrollments" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Top Performers */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={10}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h3 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>🏆 Top Performers</h3>
          <div className="space-y-2">
            {(data?.topPerformers || []).map((user, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: i === 0 ? '#fef3c7' : 'var(--gray-50)' }}>
                <span className="w-6 text-center text-sm font-bold" style={{ color: i < 3 ? '#d97706' : 'var(--gray-400)' }}>{i + 1}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: COLORS[i % COLORS.length] }}>{user.name?.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate" style={{ color: 'var(--gray-800)' }}>{user.name}</div>
                  <div className="text-xs" style={{ color: 'var(--gray-400)' }}>{user.email}</div>
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--blue-600)' }}>{user.progressStats?.totalSolved}</span>
              </div>
            ))}
            {(!data?.topPerformers || data.topPerformers.length === 0) && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--gray-400)' }}>No data yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
