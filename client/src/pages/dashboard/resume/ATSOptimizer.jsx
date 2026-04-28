import { useState } from 'react';
import { motion } from 'framer-motion';
import { resumeAPI } from '../../../services/api';
import toast from 'react-hot-toast';

const ATSOptimizer = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const optimize = async () => {
    if (!resumeText.trim() || !jobDesc.trim()) return toast.error('Both resume and job description are required');
    setLoading(true);
    try {
      const { data } = await resumeAPI.optimize(resumeText, jobDesc);
      setResult(data);
      toast.success('Optimization complete!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--gray-700)' }}>📄 Your Resume Text *</label>
          <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} rows={8}
            className="input-light !text-sm resize-y" placeholder="Paste your resume content here..." />
        </div>
        <div>
          <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--gray-700)' }}>🎯 Target Job Description *</label>
          <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} rows={8}
            className="input-light !text-sm resize-y" placeholder="Paste the job description you're applying for..." />
        </div>
      </div>
      <button onClick={optimize} disabled={loading || !resumeText.trim() || !jobDesc.trim()}
        className="btn-primary !py-3 !px-8 disabled:opacity-50">
        {loading ? '⚡ Optimizing...' : '🚀 Optimize for This Job'}
      </button>

      {result && !result.raw && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Score improvement */}
          {result.estimatedScoreImprovement && (
            <div className="p-4 rounded-xl text-center" style={{ background: 'linear-gradient(135deg, #dcfce7, #d1fae5)' }}>
              <p className="text-2xl font-extrabold" style={{ color: '#16a34a' }}>+{result.estimatedScoreImprovement}%</p>
              <p className="text-xs font-medium" style={{ color: '#15803d' }}>Estimated ATS Score Improvement</p>
            </div>
          )}

          {/* Keyword Alignment */}
          {result.keywordAlignment && (
            <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
              <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--gray-900)' }}>🔑 Keyword Alignment</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {result.keywordAlignment.matched?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: '#16a34a' }}>✅ Matched Keywords</p>
                    <div className="flex flex-wrap gap-1">{result.keywordAlignment.matched.map((k, i) => (
                      <span key={i} className="text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>{k}</span>
                    ))}</div>
                  </div>
                )}
                {result.keywordAlignment.toAdd?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: '#dc2626' }}>❌ Missing — Add These</p>
                    <div className="flex flex-wrap gap-1">{result.keywordAlignment.toAdd.map((k, i) => (
                      <span key={i} className="text-[0.65rem] px-2 py-0.5 rounded-full" style={{ background: '#fef2f2', color: '#dc2626' }}>{k}</span>
                    ))}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Optimized Summary */}
          {result.optimizedSections?.summary && (
            <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
              <h4 className="text-sm font-bold mb-2" style={{ color: 'var(--gray-900)' }}>📝 Optimized Summary</h4>
              <p className="text-sm p-3 rounded-lg" style={{ background: '#f0fdf4', color: 'var(--gray-700)', lineHeight: 1.6 }}>{result.optimizedSections.summary}</p>
            </div>
          )}

          {/* Experience Improvements */}
          {result.optimizedSections?.experience?.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
              <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--gray-900)' }}>💼 Experience Bullet Improvements</h4>
              <div className="space-y-3">
                {result.optimizedSections.experience.map((item, i) => (
                  <div key={i} className="p-3 rounded-lg" style={{ background: 'var(--gray-50)' }}>
                    <div className="grid sm:grid-cols-2 gap-3 mb-2">
                      <div>
                        <p className="text-[0.6rem] font-bold mb-1" style={{ color: '#dc2626' }}>ORIGINAL</p>
                        <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{item.original}</p>
                      </div>
                      <div>
                        <p className="text-[0.6rem] font-bold mb-1" style={{ color: '#16a34a' }}>OPTIMIZED</p>
                        <p className="text-xs font-medium" style={{ color: 'var(--gray-700)' }}>{item.optimized}</p>
                      </div>
                    </div>
                    {item.reason && <p className="text-[0.65rem] italic" style={{ color: 'var(--gray-400)' }}>💡 {item.reason}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {result.optimizedSections?.skills && (
            <div className="bg-white p-4 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
              <h4 className="text-sm font-bold mb-3" style={{ color: 'var(--gray-900)' }}>🛠️ Skills Recommendations</h4>
              {result.optimizedSections.skills.add?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold mb-1" style={{ color: '#2563eb' }}>Add these skills:</p>
                  <div className="flex flex-wrap gap-1">{result.optimizedSections.skills.add.map((s, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: '#dbeafe', color: '#1d4ed8' }}>+ {s}</span>
                  ))}</div>
                </div>
              )}
              {result.optimizedSections.skills.reword?.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold mb-1" style={{ color: '#7c3aed' }}>Reword:</p>
                  {result.optimizedSections.skills.reword.map((r, i) => (
                    <p key={i} className="text-xs" style={{ color: 'var(--gray-600)' }}>
                      <span style={{ color: '#dc2626' }}>{r.from}</span> → <span className="font-semibold" style={{ color: '#16a34a' }}>{r.to}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* General Tips */}
          {result.optimizedSections?.general?.length > 0 && (
            <div className="p-4 rounded-xl" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <p className="text-xs font-bold mb-2" style={{ color: '#1d4ed8' }}>💡 General Tips</p>
              <ul className="space-y-1">{result.optimizedSections.general.map((t, i) => (
                <li key={i} className="text-xs" style={{ color: '#1e40af' }}>• {t}</li>
              ))}</ul>
            </div>
          )}
        </motion.div>
      )}

      {result?.raw && (
        <div className="bg-white p-6 rounded-xl shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>{result.optimizedSections?.general?.[0]}</p>
        </div>
      )}
    </div>
  );
};

export default ATSOptimizer;
