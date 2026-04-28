import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTrophy, FaMedal, FaFire, FaCode, FaGraduationCap, FaBrain } from 'react-icons/fa';
import { leaderboardAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04 } }) };

const medals = ['🥇', '🥈', '🥉'];
const rankColors = ['linear-gradient(135deg,#fbbf24,#f59e0b)', 'linear-gradient(135deg,#d1d5db,#9ca3af)', 'linear-gradient(135deg,#d97706,#b45309)'];

const Leaderboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leaderboardAPI.getAll().then(({ data }) => { setData(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const myRank = data.find(u => u._id === user?._id);

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>🏆 Leaderboard</h1>
        <p style={{ color: 'var(--gray-500)' }}>Top performers on VedhaEduSpark</p>
      </motion.div>

      {/* My Rank Card */}
      {myRank && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="p-5 rounded-[16px] flex items-center gap-4" style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)', border: '1px solid #c7d2fe' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ background: 'var(--gradient-blue)' }}>#{myRank.rank}</div>
          <div className="flex-1">
            <p className="font-bold" style={{ color: 'var(--blue-700)' }}>Your Rank</p>
            <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{myRank.points} pts • {myRank.problemsSolved} problems • {myRank.coursesCompleted} courses</p>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#f59e0b' }}><FaFire /> {myRank.streak}</div>
        </motion.div>
      )}

      {/* Top 3 Podium */}
      {!loading && data.length >= 3 && (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="grid grid-cols-3 gap-3 text-center">
          {[1, 0, 2].map(idx => {
            const u = data[idx];
            if (!u) return null;
            return (
              <div key={u._id} className={`p-4 rounded-[16px] bg-white shadow-sm ${idx === 0 ? 'ring-2 ring-yellow-400 -mt-4' : ''}`} style={{ border: '1px solid var(--gray-200)' }}>
                <div className="text-3xl mb-1">{medals[idx]}</div>
                <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold overflow-hidden" style={{ background: rankColors[idx] }}>
                  {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0]}
                </div>
                <h3 className="font-bold text-sm truncate" style={{ color: 'var(--gray-900)' }}>{u.name}</h3>
                <p className="text-[0.65rem] mb-2 truncate" style={{ color: 'var(--gray-400)' }}>{u.college || 'Student'}</p>
                <div className="text-lg font-extrabold" style={{ color: 'var(--blue-600)' }}>{u.points}</div>
                <div className="text-[0.6rem] uppercase font-semibold" style={{ color: 'var(--gray-400)' }}>points</div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Full Table */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
      ) : (
        <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Rank</th>
                <th className="py-3 px-4 text-left text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>User</th>
                <th className="py-3 px-4 text-center text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}><FaCode className="inline" /> Problems</th>
                <th className="py-3 px-4 text-center text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}><FaGraduationCap className="inline" /> Courses</th>
                <th className="py-3 px-4 text-center text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}><FaBrain className="inline" /> Quizzes</th>
                <th className="py-3 px-4 text-center text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}><FaFire className="inline" /> Streak</th>
                <th className="py-3 px-4 text-right text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Points</th>
              </tr></thead>
              <tbody>
                {data.map((u, i) => (
                  <motion.tr key={u._id} variants={fadeUp} initial="hidden" animate="visible" custom={i}
                    className={`transition-colors hover:bg-blue-50/50 ${u._id === user?._id ? 'bg-blue-50/70' : ''}`}
                    style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td className="py-3 px-4">
                      <span className="font-bold text-sm" style={{ color: i < 3 ? '#f59e0b' : 'var(--gray-500)' }}>
                        {i < 3 ? medals[i] : `#${u.rank}`}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white overflow-hidden" style={{ background: 'var(--gradient-blue)' }}>
                          {u.avatar ? <img src={u.avatar} className="w-full h-full object-cover" /> : u.name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-semibold" style={{ color: 'var(--gray-800)' }}>{u.name}</div>
                          <div className="text-[0.6rem]" style={{ color: 'var(--gray-400)' }}>{u.college || 'Student'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-medium" style={{ color: 'var(--gray-600)' }}>{u.problemsSolved}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium" style={{ color: 'var(--gray-600)' }}>{u.coursesCompleted}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium" style={{ color: 'var(--gray-600)' }}>{u.quizzesPassed}</td>
                    <td className="py-3 px-4 text-center text-sm font-medium" style={{ color: u.streak > 0 ? '#f59e0b' : 'var(--gray-400)' }}>{u.streak}🔥</td>
                    <td className="py-3 px-4 text-right font-bold text-sm" style={{ color: 'var(--blue-600)' }}>{u.points}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
