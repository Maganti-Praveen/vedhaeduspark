import { useState } from 'react';
import { motion } from 'framer-motion';
import ATSChecker from './resume/ATSChecker';
import ResumeBuilder from './resume/ResumeBuilder';
import ATSOptimizer from './resume/ATSOptimizer';

const TABS = [
  { id: 'checker', label: '🔍 ATS Checker', desc: 'Score your resume' },
  { id: 'builder', label: '📝 Resume Builder', desc: 'Build from scratch' },
  { id: 'optimizer', label: '⚡ ATS Optimizer', desc: 'Optimize for a job' },
];

const ResumeTools = () => {
  const [tab, setTab] = useState('checker');

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>📄 Resume Tools</h1>
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Build, check, and optimize your resume for ATS systems</p>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all"
            style={{
              background: tab === t.id ? 'var(--blue-600)' : 'var(--gray-100)',
              color: tab === t.id ? '#fff' : 'var(--gray-500)',
              boxShadow: tab === t.id ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
            }}>
            {t.label}
            <span className="text-[0.6rem] font-normal opacity-80 hidden sm:inline">— {t.desc}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {tab === 'checker' && <ATSChecker />}
        {tab === 'builder' && <ResumeBuilder />}
        {tab === 'optimizer' && <ATSOptimizer />}
      </motion.div>
    </div>
  );
};

export default ResumeTools;
