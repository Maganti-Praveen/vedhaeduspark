import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle, FaCode } from 'react-icons/fa';
import { HiTrendingUp, HiCheckCircle, HiClock } from 'react-icons/hi';
import { submissionAPI } from '../../services/api';
import { SkeletonTable } from '../../components/common/Skeleton';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

const Progress = () => {
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([submissionAPI.getStats(), submissionAPI.getAll({ limit: 50 })]).then(([statsRes, subRes]) => {
      setStats(statsRes.data); setSubmissions(subRes.data.submissions || []); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><div className="skeleton h-10 w-48"></div><SkeletonTable rows={8} /></div>;

  const statCards = [
    { icon: <FaCode className="text-xl" />, value: stats?.uniqueSolved || 0, label: 'Unique Solved', bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    { icon: <HiCheckCircle className="text-xl" />, value: `${stats?.successRate || 0}%`, label: 'Acceptance Rate', bg: '#dcfce7', color: '#16a34a' },
    { icon: <HiTrendingUp className="text-xl" />, value: stats?.totalSubmissions || 0, label: 'Total Submissions', bg: '#f3e8ff', color: '#9333ea' },
  ];

  const difficultyData = stats?.difficultyStats || [];
  const counts = { Easy: difficultyData.find(d => d._id === 'Easy')?.count || 0, Medium: difficultyData.find(d => d._id === 'Medium')?.count || 0, Hard: difficultyData.find(d => d._id === 'Hard')?.count || 0 };

  return (
    <div className="space-y-8">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>Progress Tracker</h1>
        <p style={{ color: 'var(--gray-500)' }}>Monitor your coding journey</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
            className="bg-white rounded-[16px] p-6 text-center shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: stat.bg, color: stat.color }}>{stat.icon}</div>
            <div className="text-3xl font-bold" style={{ color: 'var(--gray-900)' }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
        className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <h2 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Difficulty Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Easy', count: counts.Easy, bg: '#dcfce7', border: '#bbf7d0', color: '#16a34a' },
            { label: 'Medium', count: counts.Medium, bg: '#fff7ed', border: '#fed7aa', color: '#d97706' },
            { label: 'Hard', count: counts.Hard, bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
          ].map((d, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ background: d.bg, border: `1px solid ${d.border}` }}>
              <div className="text-2xl font-bold" style={{ color: d.color }}>{d.count}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>{d.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}
        className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="p-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
          <h2 className="font-bold" style={{ color: 'var(--gray-900)' }}>Submission History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Problem</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Language</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Status</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Runtime</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Date</th>
            </tr></thead>
            <tbody>
              {submissions.map((sub, i) => (
                <tr key={sub._id || i} className="hover:bg-gray-50" style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{sub.problemId?.title || 'Unknown'}</td>
                  <td className="py-3 px-4 text-xs uppercase" style={{ color: 'var(--gray-500)' }}>{sub.language}</td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                    sub.status === 'Accepted' ? 'badge-easy' : 'badge-hard'
                  }`}>{sub.status === 'Accepted' ? <FaCheckCircle /> : <FaTimesCircle />}{sub.status}</span></td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--gray-500)' }}>{sub.runtime}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--gray-400)' }}>{new Date(sub.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {submissions.length === 0 && <div className="text-center py-12"><HiClock className="text-4xl mx-auto mb-2" style={{ color: 'var(--gray-300)' }} /><p className="text-sm" style={{ color: 'var(--gray-500)' }}>No submissions yet.</p></div>}
      </motion.div>
    </div>
  );
};

export default Progress;
