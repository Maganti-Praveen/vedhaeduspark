import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiCode, HiCheckCircle, HiTrendingUp, HiArrowRight } from 'react-icons/hi';
import { FaFire, FaMedal } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, submissionAPI, enrollmentAPI } from '../../services/api';
import { SkeletonCard } from '../../components/common/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const DashboardHome = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authAPI.getMe().catch(() => ({ data: null })),
      submissionAPI.getStats().catch(() => ({ data: { totalSubmissions: 0, accepted: 0, successRate: 0, uniqueSolved: 0, recentSubmissions: [] } })),
      enrollmentAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([profileRes, statsRes, enrollRes]) => {
      setProfile(profileRes.data);
      setStats(statsRes.data);
      setEnrollments(enrollRes.data);
      setLoading(false);
    });
  }, []);

  const statCards = stats ? [
    { icon: <HiCode className="text-2xl" />, value: stats.uniqueSolved, label: 'Problems Solved', bg: 'var(--blue-100)', iconColor: 'var(--blue-700)' },
    { icon: <HiCheckCircle className="text-2xl" />, value: `${stats.successRate}%`, label: 'Success Rate', bg: '#dcfce7', iconColor: '#16a34a' },
    { icon: <HiTrendingUp className="text-2xl" />, value: stats.totalSubmissions, label: 'Total Submissions', bg: '#f3e8ff', iconColor: '#9333ea' },
    { icon: <HiAcademicCap className="text-2xl" />, value: enrollments.length, label: 'Enrolled Courses', bg: 'var(--orange-100)', iconColor: 'var(--orange-600)' },
  ] : [];

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-64"></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28"></div>)}</div>
    </div>
  );

  const displayName = profile?.name || user?.name || 'Student';

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp}
        className="rounded-[20px] p-6 sm:p-8 text-white relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute rounded-full opacity-10" style={{ width: 200, height: 200, background: 'var(--orange-400)', top: -50, right: -30 }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {profile?.avatar ? (
              <img src={profile.avatar} alt="Avatar" className="w-16 h-16 rounded-xl border-2 border-white/30 object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-bold border-2 border-white/30"
                style={{ background: 'rgba(255,255,255,0.15)' }}>
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">
                Welcome back, {displayName.split(' ')[0]}! 👋
              </h1>
              <p className="text-sm opacity-80 mt-0.5">Here's your learning overview.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {profile?.streak > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <FaFire className="text-orange-300" /> {profile.streak} Day Streak
              </div>
            )}
            {profile?.badges?.length > 0 && (
              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <FaMedal className="text-yellow-300" /> {profile.badges.length} Badges
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
            className="bg-white rounded-[16px] p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            style={{ border: '1px solid var(--gray-200)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: stat.bg, color: stat.iconColor }}>{stat.icon}</div>
            <div className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>{stat.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Difficulty Progress Mini */}
      {profile?.progressStats && (profile.progressStats.easy > 0 || profile.progressStats.medium > 0 || profile.progressStats.hard > 0) && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={5}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>Difficulty Breakdown</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Easy', val: profile.progressStats.easy, color: '#22c55e', bg: '#dcfce7' },
              { label: 'Medium', val: profile.progressStats.medium, color: '#f59e0b', bg: '#fef3c7' },
              { label: 'Hard', val: profile.progressStats.hard, color: '#ef4444', bg: '#fee2e2' },
            ].map((d, i) => (
              <div key={i} className="text-center p-3 rounded-xl" style={{ background: d.bg }}>
                <div className="text-2xl font-bold" style={{ color: d.color }}>{d.val}</div>
                <div className="text-xs font-semibold" style={{ color: d.color }}>{d.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Submissions */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={6}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>Recent Submissions</h2>
            <Link to="/dashboard/progress" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--blue-600)' }}>View All <HiArrowRight /></Link>
          </div>
          {stats?.recentSubmissions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentSubmissions.slice(0, 5).map((sub, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--gray-50)' }}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sub.status === 'Accepted' ? 'bg-green-500' : 'bg-red-500'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--gray-800)' }}>{sub.problemId?.title || 'Problem'}</div>
                    <div className="text-xs" style={{ color: 'var(--gray-400)' }}>{sub.language} • {new Date(sub.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${sub.status === 'Accepted' ? 'badge-easy' : 'badge-hard'}`}>{sub.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiCode className="text-4xl mx-auto mb-2" style={{ color: 'var(--gray-300)' }} />
              <p className="text-sm" style={{ color: 'var(--gray-500)' }}>No submissions yet.</p>
              <Link to="/dashboard/practice" className="text-sm mt-2 inline-block font-medium" style={{ color: 'var(--blue-600)' }}>Go to Practice →</Link>
            </div>
          )}
        </motion.div>

        {/* My Courses */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={7}
          className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>My Courses</h2>
            <Link to="/courses" className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--blue-600)' }}>Browse <HiArrowRight /></Link>
          </div>
          {enrollments.length > 0 ? (
            <div className="space-y-3">
              {enrollments.slice(0, 5).map((enr, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ background: 'var(--gray-50)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{enr.courseId?.title}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--blue-600)' }}>{enr.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--gray-200)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${enr.progress}%`, background: 'var(--gradient-blue)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiAcademicCap className="text-4xl mx-auto mb-2" style={{ color: 'var(--gray-300)' }} />
              <p className="text-sm" style={{ color: 'var(--gray-500)' }}>No courses enrolled yet.</p>
              <Link to="/courses" className="text-sm mt-2 inline-block font-medium" style={{ color: 'var(--blue-600)' }}>Explore Courses →</Link>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={8}>
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--gray-900)' }}>Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Learn DSA', path: '/dashboard/learning', icon: '🧮', bg: 'var(--blue-50)' },
            { label: 'Practice Coding', path: '/dashboard/practice', icon: '💻', bg: '#dcfce7' },
            { label: 'View Progress', path: '/dashboard/progress', icon: '📊', bg: '#f3e8ff' },
            { label: 'Browse Courses', path: '/courses', icon: '📚', bg: 'var(--orange-50)' },
          ].map((action, i) => (
            <Link key={i} to={action.path}
              className="p-5 rounded-[16px] text-center transition-all hover:-translate-y-1 hover:shadow-md"
              style={{ background: action.bg, border: '1px solid var(--gray-100)' }}>
              <div className="text-3xl mb-2">{action.icon}</div>
              <div className="text-sm font-semibold" style={{ color: 'var(--gray-700)' }}>{action.label}</div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
