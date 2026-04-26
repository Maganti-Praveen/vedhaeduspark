import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt, FaYoutube, FaGithub, FaCode, FaBook, FaTools } from 'react-icons/fa';
import { HiSearch } from 'react-icons/hi';
import { resourceAPI } from '../../services/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };

const typeIcons = { article: <FaBook />, video: <FaYoutube />, github: <FaGithub />, tool: <FaTools />, course: <FaCode />, other: <FaExternalLinkAlt /> };
const CATEGORIES = ['All', 'DSA', 'DBMS', 'OS', 'CN', 'Web Dev', 'Mobile Dev', 'AI/ML', 'Cloud', 'DevOps', 'Interview Prep', 'Other'];

// Hardcoded defaults (shown when DB is empty for that category)
const DEFAULTS = [
  { title: 'GeeksforGeeks - DSA Tutorial', url: 'https://www.geeksforgeeks.org/data-structures/', category: 'DSA', type: 'article', icon: '🧮' },
  { title: 'LeetCode Problems', url: 'https://leetcode.com/problemset/', category: 'DSA', type: 'tool', icon: '🧮' },
  { title: 'Striver SDE Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', category: 'DSA', type: 'article', icon: '🧮' },
  { title: 'DBMS Complete Notes - GFG', url: 'https://www.geeksforgeeks.org/dbms/', category: 'DBMS', type: 'article', icon: '🗄️' },
  { title: 'SQL Practice - W3Schools', url: 'https://www.w3schools.com/sql/', category: 'DBMS', type: 'tool', icon: '🗄️' },
  { title: 'Operating Systems - GFG', url: 'https://www.geeksforgeeks.org/operating-systems/', category: 'OS', type: 'article', icon: '⚙️' },
  { title: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/', category: 'Web Dev', type: 'course', icon: '💻' },
  { title: 'MDN Web Docs', url: 'https://developer.mozilla.org/', category: 'Web Dev', type: 'article', icon: '💻' },
  { title: 'GitHub Student Pack', url: 'https://education.github.com/pack', category: 'Web Dev', type: 'github', icon: '💻' },
];

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const params = filter ? { category: filter } : {};
    resourceAPI.getAll(params).then(({ data }) => {
      // Merge DB resources with defaults (defaults only when no DB data exists)
      const allResources = data.length > 0 ? data : DEFAULTS;
      setResources(allResources);
      setLoading(false);
    }).catch(() => { setResources(DEFAULTS); setLoading(false); });
  }, [filter]);

  const filtered = search
    ? resources.filter(r => r.title.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase()))
    : resources;

  // Group by category
  const grouped = {};
  filtered.forEach(r => {
    const cat = r.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(r);
  });

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>📚 Resources</h1>
        <p style={{ color: 'var(--gray-500)' }}>Curated learning resources for CSE students</p>
      </motion.div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..."
            className="input-light !pl-9 !py-2" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setFilter(c === 'All' ? '' : c)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: (c === 'All' && !filter) || filter === c ? 'var(--blue-600)' : 'var(--gray-100)',
                color: (c === 'All' && !filter) || filter === c ? '#fff' : 'var(--gray-500)',
              }}>{c}</button>
          ))}
        </div>
      </div>

      {/* Grouped Resources */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-[16px]" />)}</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <p className="text-3xl mb-2">📚</p>
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No resources found</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(grouped).map(([cat, items], i) => (
            <motion.div key={cat} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
              className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
                <span>{items[0]?.icon || '📚'}</span> {cat}
                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--gray-100)', color: 'var(--gray-400)' }}>{items.length}</span>
              </h2>
              <div className="space-y-2">
                {items.map((res, j) => (
                  <a key={j} href={res.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group hover:-translate-y-0.5"
                    style={{ background: 'var(--gray-50)', color: 'var(--gray-700)' }}>
                    <span style={{ color: 'var(--gray-400)' }}>{typeIcons[res.type] || <FaExternalLinkAlt />}</span>
                    <span className="flex-1 group-hover:text-blue-600 transition-colors">{res.title}</span>
                    <FaExternalLinkAlt className="text-xs flex-shrink-0" style={{ color: 'var(--gray-300)' }} />
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Resources;
