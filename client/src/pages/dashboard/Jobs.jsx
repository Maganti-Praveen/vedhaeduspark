import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiSearch, HiBriefcase, HiLocationMarker, HiExternalLink, HiClock } from 'react-icons/hi';
import { FaFilter } from 'react-icons/fa';
import { jobAPI } from '../../services/api';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }) };

const CATEGORIES = ['All', 'Software Development', 'Data Science', 'Web Development', 'Mobile Development', 'DevOps', 'Cybersecurity', 'AI/ML', 'Cloud Computing', 'Database', 'Internship', 'Other'];
const TYPES = ['All', 'Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const catColors = {
  'Software Development': '#6366f1', 'Data Science': '#8b5cf6', 'Web Development': '#2563eb',
  'Mobile Development': '#06b6d4', 'DevOps': '#f59e0b', 'Cybersecurity': '#ef4444',
  'AI/ML': '#ec4899', 'Cloud Computing': '#14b8a6', 'Database': '#84cc16', 'Internship': '#22c55e', 'Other': '#94a3b8',
};

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const fetchJobs = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (type) params.type = type;
    jobAPI.getAll(params).then(({ data }) => { setJobs(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [category, type]);
  useEffect(() => { const t = setTimeout(fetchJobs, 400); return () => clearTimeout(t); }, [search]);

  const activeFilters = [category, type].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>💼 Jobs & Opportunities</h1>
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Find internships and job opportunities in tech</p>
      </motion.div>

      {/* Search + Filter Toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, companies, roles..."
            className="input-light !pl-9 !py-2.5" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 px-4 rounded-xl text-sm font-semibold transition-colors relative"
          style={{ background: activeFilters > 0 ? 'var(--blue-50)' : 'var(--gray-100)', color: activeFilters > 0 ? 'var(--blue-600)' : 'var(--gray-500)' }}>
          <FaFilter /> Filters
          {activeFilters > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[0.6rem] font-bold text-white"
              style={{ background: 'var(--blue-600)' }}>{activeFilters}</span>
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-[16px] p-5 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gray-400)' }}>Category</div>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setCategory(c === 'All' ? '' : c)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: (c === 'All' && !category) || category === c ? 'var(--blue-600)' : 'var(--gray-100)',
                      color: (c === 'All' && !category) || category === c ? '#fff' : 'var(--gray-500)',
                    }}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gray-400)' }}>Type</div>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setType(t === 'All' ? '' : t)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={{
                      background: (t === 'All' && !type) || type === t ? 'var(--blue-600)' : 'var(--gray-100)',
                      color: (t === 'All' && !type) || type === t ? '#fff' : 'var(--gray-500)',
                    }}>{t}</button>
                ))}
              </div>
            </div>
            {activeFilters > 0 && (
              <button onClick={() => { setCategory(''); setType(''); }} className="text-xs font-semibold" style={{ color: '#ef4444' }}>
                Clear Filters
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Results count */}
      <div className="text-xs font-medium" style={{ color: 'var(--gray-400)' }}>{jobs.length} opportunities found</div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-48 rounded-[16px]" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <HiBriefcase className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No jobs found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--gray-400)' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {jobs.map((job, i) => {
            const color = catColors[job.category] || '#6366f1';
            const isExpired = job.deadline && new Date(job.deadline) < new Date();
            return (
              <motion.div key={job._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                className="bg-white rounded-[16px] p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ border: '1px solid var(--gray-200)', opacity: isExpired ? 0.6 : 1 }}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{job.category}</span>
                      <span className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>{job.type}</span>
                      {isExpired && <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fee2e2', color: '#ef4444' }}>Expired</span>}
                    </div>
                    <h3 className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>{job.title}</h3>
                    <p className="text-xs font-medium mt-0.5" style={{ color }}>{job.company}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}88)` }}>
                    {job.company?.charAt(0)}
                  </div>
                </div>

                {/* Details */}
                <p className="text-xs mt-3 line-clamp-2" style={{ color: 'var(--gray-500)' }}>{job.description}</p>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs" style={{ color: 'var(--gray-400)' }}>
                  <span className="flex items-center gap-1"><HiBriefcase /> {job.role}</span>
                  <span className="flex items-center gap-1"><HiLocationMarker /> {job.location}</span>
                  {job.experience && <span>📊 {job.experience}</span>}
                  {job.salary && <span>💰 {job.salary}</span>}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--gray-100)' }}>
                  <div className="text-[0.6rem]" style={{ color: 'var(--gray-400)' }}>
                    {job.deadline && <span className="flex items-center gap-1"><HiClock /> Deadline: {new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>}
                  </div>
                  <a href={job.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: `${color}15`, color }}>
                    Apply <HiExternalLink />
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;
