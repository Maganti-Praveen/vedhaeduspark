import { useState } from 'react';
import { motion } from 'framer-motion';
import { resumeAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const ScoreGauge = ({ score }) => {
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const circ = 2 * Math.PI * 54;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
        <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-[0.6rem] font-semibold" style={{ color: '#64748b' }}>/ 100</span>
      </div>
    </div>
  );
};

const SectionCard = ({ name, data }) => {
  if (!data) return null;
  const color = data.score >= 75 ? '#22c55e' : data.score >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold capitalize" style={{ color: 'var(--gray-800)' }}>{name}</h4>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}20`, color }}>{data.score}/100</span>
      </div>
      <div className="w-full h-1.5 rounded-full mb-2" style={{ background: '#f1f5f9' }}>
        <div className="h-full rounded-full" style={{ width: `${data.score}%`, background: color, transition: 'width 1s' }} />
      </div>
      <p className="text-xs mb-2" style={{ color: 'var(--gray-500)' }}>{data.feedback}</p>
      {data.suggestions?.length > 0 && (
        <ul className="space-y-1">{data.suggestions.map((s, i) => (
          <li key={i} className="text-xs flex gap-1.5" style={{ color: 'var(--gray-600)' }}>
            <span>💡</span><span>{s}</span>
          </li>
        ))}</ul>
      )}
      {data.missing?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">{data.missing.map((k, i) => (
          <span key={i} className="text-[0.6rem] px-2 py-0.5 rounded-full font-semibold" style={{ background: '#fef2f2', color: '#dc2626' }}>+ {k}</span>
        ))}</div>
      )}
    </div>
  );
};

const ATSChecker = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (resumeText.trim().length < 50) return toast.error('Paste at least 50 characters of resume text');
    setLoading(true);
    try {
      const { data } = await resumeAPI.atsCheck(resumeText, jobDesc);
      setResult(data);
      toast.success('Analysis complete!');
    } catch (err) { toast.error(err.response?.data?.message || 'Analysis failed'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--gray-700)' }}>📄 Paste Your Resume Text *</label>
          <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={10}
            className="input-light !text-sm resize-y" placeholder="Paste your entire resume text here..." />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--gray-700)' }}>🎯 Job Description <span className="font-normal" style={{ color: 'var(--gray-400)' }}>(optional, for targeted analysis)</span></label>
          <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={10}
            className="input-light !text-sm resize-y" placeholder="Paste the target job description for better keyword matching..." />
        </div>
      </div>
      <button onClick={analyze} disabled={loading || resumeText.trim().length < 50}
        className="btn-primary !py-3 !px-8 disabled:opacity-50">
        {loading ? '🔍 Analyzing...' : '🚀 Analyze Resume'}
      </button>

      {result && !result.raw && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white p-6 rounded-[20px] shadow-sm text-center" style={{ border: '1px solid var(--gray-200)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--gray-900)' }}>ATS Compatibility Score</h3>
            <ScoreGauge score={result.score || 0} />
            <p className="text-sm mt-4 max-w-xl mx-auto" style={{ color: 'var(--gray-500)' }}>{result.summary}</p>
          </div>

          {result.topImprovements?.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#1d4ed8' }}>🎯 Top Improvements</p>
              <ul className="space-y-1">{result.topImprovements.map((t, i) => (
                <li key={i} className="text-xs flex gap-1.5" style={{ color: '#1e40af' }}><span>{i + 1}.</span><span>{t}</span></li>
              ))}</ul>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.sections && Object.entries(result.sections).map(([key, val]) => (
              <SectionCard key={key} name={key} data={val} />
            ))}
          </div>

          {result.atsKeywords?.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--gray-700)' }}>🔑 Important ATS Keywords</p>
              <div className="flex flex-wrap gap-1.5">{result.atsKeywords.map((k, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#f0fdf4', color: '#16a34a' }}>{k}</span>
              ))}</div>
            </div>
          )}
        </motion.div>
      )}

      {result?.raw && (
        <div className="bg-white p-6 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>{result.summary}</p>
        </div>
      )}
    </div>
  );
};

export default ATSChecker;
