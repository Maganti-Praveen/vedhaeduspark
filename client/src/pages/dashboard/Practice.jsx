import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaSearch, FaCode } from 'react-icons/fa';
import { HiCheckCircle } from 'react-icons/hi';
import { problemAPI, submissionAPI } from '../../services/api';
import { SkeletonTable } from '../../components/common/Skeleton';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.4 } }) };

const Practice = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState('');
  const [topic, setTopic] = useState('');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  const [topics, setTopics] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const navigate = useNavigate();

  useEffect(() => { const t = setTimeout(() => setSearchDebounced(search), 300); return () => clearTimeout(t); }, [search]);

  useEffect(() => {
    problemAPI.getTopics().then(({ data }) => setTopics(data)).catch(() => {});
    submissionAPI.getStats().then(({ data }) => {
      const solved = new Set();
      data.recentSubmissions?.forEach(s => { if (s.status === 'Accepted') solved.add(s.problemId?._id); });
      setSolvedIds(solved);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (difficulty) params.difficulty = difficulty;
    if (topic) params.topic = topic;
    if (searchDebounced) params.search = searchDebounced;
    problemAPI.getAll(params).then(({ data }) => { setProblems(data.problems || []); setLoading(false); }).catch(() => setLoading(false));
  }, [difficulty, topic, searchDebounced]);

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>Practice Problems</h1>
        <p style={{ color: 'var(--gray-500)' }}>Sharpen your coding skills with curated problems</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1} className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--gray-300)' }} />
          <input type="text" placeholder="Search problems..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-light !pl-10 !py-2.5 !text-sm" />
        </div>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="input-light !py-2.5 !text-sm !w-auto cursor-pointer">
          <option value="">All Difficulty</option>
          <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
        </select>
        <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input-light !py-2.5 !text-sm !w-auto cursor-pointer">
          <option value="">All Topics</option>
          {topics.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </motion.div>

      {loading ? <SkeletonTable rows={8} /> : (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}
          className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase w-12" style={{ color: 'var(--gray-400)' }}>Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Title</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase w-24" style={{ color: 'var(--gray-400)' }}>Difficulty</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase w-28" style={{ color: 'var(--gray-400)' }}>Topic</th>
                <th className="text-left py-3 px-4 text-xs font-semibold uppercase w-24" style={{ color: 'var(--gray-400)' }}>Action</th>
              </tr></thead>
              <tbody>
                {problems.map((p, i) => (
                  <tr key={p._id} className="cursor-pointer transition-colors hover:bg-gray-50" onClick={() => navigate(`/solve/${p._id}`)}
                    style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td className="py-3 px-4">
                      {solvedIds.has(p._id) ? <HiCheckCircle className="text-green-500 text-lg" /> : <div className="w-4 h-4 rounded-full" style={{ border: '2px solid var(--gray-300)' }} />}
                    </td>
                    <td className="py-3 px-4 font-medium text-sm hover:text-blue-600 transition-colors" style={{ color: 'var(--gray-800)' }}>{p.title}</td>
                    <td className="py-3 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      p.difficulty === 'Easy' ? 'badge-easy' : p.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
                    }`}>{p.difficulty}</span></td>
                    <td className="py-3 px-4 text-xs" style={{ color: 'var(--gray-500)' }}>{p.topic}</td>
                    <td className="py-3 px-4">
                      <button className="text-xs font-semibold flex items-center gap-1" style={{ color: 'var(--blue-600)' }}>
                        <FaCode /> Solve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {problems.length === 0 && (
            <div className="text-center py-12">
              <FaCode className="text-4xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
              <p style={{ color: 'var(--gray-500)' }}>No problems found. Try adjusting your filters.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Practice;
