import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { FaPlay, FaUpload, FaArrowLeft } from 'react-icons/fa';
import { problemAPI, judgeAPI } from '../../services/api';
import { SkeletonIDE } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const languages = [
  { id: 'c', label: 'C', monacoLang: 'c' },
  { id: 'cpp', label: 'C++', monacoLang: 'cpp' },
  { id: 'java', label: 'Java', monacoLang: 'java' },
  { id: 'python', label: 'Python', monacoLang: 'python' },
];

const ProblemSolve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState(languages[1]);
  const [code, setCode] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'output'

  useEffect(() => {
    problemAPI.getById(id).then(({ data }) => {
      setProblem(data);
      // Auto-fill input with first sample test case
      if (data.sampleTestCases?.length > 0) {
        setInput(data.sampleTestCases[0].input);
      }
      // Set starter code
      if (data.starterCode?.[languages[1].id]) {
        setCode(data.starterCode[languages[1].id]);
      }
      setLoading(false);
    }).catch(() => { toast.error('Problem not found'); navigate('/dashboard/practice'); });
  }, [id]);

  // Update starter code when language changes
  useEffect(() => {
    if (problem?.starterCode?.[lang.id]) {
      setCode(problem.starterCode[lang.id]);
    }
  }, [lang.id]);

  const handleRun = async () => {
    if (!code.trim()) return toast.error('Write some code first');
    setRunning(true); setOutput(''); setResult(null); setActiveTab('output');
    try {
      const { data } = await judgeAPI.run({ code, language: lang.id, input });
      if (data.compile_output) {
        setOutput('❌ Compilation Error:\n' + data.compile_output);
      } else if (data.stderr) {
        setOutput('⚠️ Error:\n' + data.stderr);
      } else {
        setOutput(data.stdout || '(No output)');
      }
      setResult(data);
    } catch (err) {
      const msg = err.response?.data?.message || 'Execution failed';
      if (err.response?.status === 429) toast.error('Rate limited. Wait a moment.');
      else { setOutput('❌ ' + msg); toast.error(msg); }
    }
    setRunning(false);
  };

  const handleSubmit = async () => {
    if (!code.trim()) return toast.error('Write some code first');
    setSubmitting(true); setOutput(''); setResult(null); setActiveTab('output');
    try {
      const { data } = await judgeAPI.submit({ code, language: lang.id, problemId: id });
      setResult(data);
      if (data.status === 'Accepted') {
        setOutput(`✅ All test cases passed! (${data.passed}/${data.total})`);
        toast.success('Solution Accepted! 🎉');
      } else {
        setOutput(`❌ ${data.status} — Passed ${data.passed || 0}/${data.total || 0}\n\n${data.submission?.output || ''}`);
        toast.error(data.status);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Submission failed';
      if (err.response?.status === 429) toast.error('Rate limited. Wait a moment.');
      else { setOutput('❌ ' + msg); toast.error(msg); }
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-8"><SkeletonIDE /></div>;

  return (
    <div className="min-h-screen" style={{ background: 'var(--gray-50)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 h-14 bg-white" style={{ borderBottom: '1px solid var(--gray-200)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ color: 'var(--gray-500)' }}><FaArrowLeft /></button>
          <span className="font-bold" style={{ color: 'var(--gray-900)' }}>{problem?.title}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
            problem?.difficulty === 'Easy' ? 'badge-easy' : problem?.difficulty === 'Medium' ? 'badge-medium' : 'badge-hard'
          }`}>{problem?.difficulty}</span>
        </div>
        <div className="flex items-center gap-2">
          <select value={lang.id} onChange={(e) => setLang(languages.find(l => l.id === e.target.value))}
            className="input-light !py-2 !px-3 !text-sm !w-auto cursor-pointer">
            {languages.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
          </select>
          <button onClick={handleRun} disabled={running || submitting} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:-translate-y-0.5 disabled:opacity-50"
            style={{ background: 'var(--blue-600)', boxShadow: 'var(--shadow-blue)' }}>
            <FaPlay className="text-xs" /> {running ? 'Running...' : 'Run'}
          </button>
          <button onClick={handleSubmit} disabled={running || submitting} className="btn-primary !py-2 !px-4 !text-sm disabled:opacity-50">
            <FaUpload className="text-xs" /> {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="grid lg:grid-cols-2 gap-4 p-4 h-[calc(100vh-56px)]">
        {/* Problem Description */}
        <div className="bg-white rounded-[16px] overflow-y-auto shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="p-6 space-y-6">
            <div>
              <h1 className="text-xl font-bold mb-3" style={{ color: 'var(--gray-900)' }}>{problem?.title}</h1>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>{problem?.topic}</span>
                {problem?.solvedBy > 0 && <span className="text-xs px-3 py-1 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>Solved by {problem.solvedBy}</span>}
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--gray-700)' }}>{problem?.description}</div>
            </div>

            {/* Input/Output Format */}
            {(problem?.inputFormat || problem?.outputFormat) && (
              <div className="grid sm:grid-cols-2 gap-3">
                {problem?.inputFormat && (
                  <div className="rounded-xl p-4" style={{ background: 'var(--blue-50)', border: '1px solid var(--blue-100)' }}>
                    <div className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: 'var(--blue-600)' }}>Input Format</div>
                    <div className="text-sm font-mono" style={{ color: 'var(--gray-700)' }}>{problem.inputFormat}</div>
                  </div>
                )}
                {problem?.outputFormat && (
                  <div className="rounded-xl p-4" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                    <div className="text-xs font-bold mb-1 uppercase tracking-wider" style={{ color: '#16a34a' }}>Output Format</div>
                    <div className="text-sm font-mono" style={{ color: 'var(--gray-700)' }}>{problem.outputFormat}</div>
                  </div>
                )}
              </div>
            )}

            {/* Sample Test Cases */}
            {problem?.sampleTestCases?.map((tc, i) => (
              <div key={i} className="rounded-xl p-4" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--gray-400)' }}>Sample {i + 1}</div>
                  <button onClick={() => { setInput(tc.input); setActiveTab('input'); toast.success('Input loaded!'); }}
                    className="text-[0.65rem] font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                    Use as Input
                  </button>
                </div>
                <div className="space-y-2 text-sm font-mono">
                  <div><span className="font-semibold" style={{ color: 'var(--blue-600)' }}>Input:</span> <span style={{ color: 'var(--gray-700)' }}>{tc.input}</span></div>
                  <div><span className="font-semibold" style={{ color: '#16a34a' }}>Output:</span> <span style={{ color: 'var(--gray-700)' }}>{tc.output}</span></div>
                  {tc.explanation && <div className="text-xs" style={{ color: 'var(--gray-500)' }}><span className="font-semibold">Explanation:</span> {tc.explanation}</div>}
                </div>
              </div>
            ))}

            {/* Constraints */}
            {problem?.constraints && (
              <div>
                <h3 className="text-sm font-bold mb-2" style={{ color: 'var(--gray-900)' }}>Constraints</h3>
                <div className="text-sm font-mono rounded-xl p-4" style={{ background: 'var(--gray-50)', color: 'var(--gray-600)', border: '1px solid var(--gray-200)' }}>
                  {problem.constraints}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Editor + Output */}
        <div className="flex flex-col gap-4 min-h-0">
          <div className="bg-white rounded-[16px] overflow-hidden flex-1 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
            <Editor
              height="100%"
              language={lang.monacoLang}
              value={code}
              onChange={(v) => setCode(v || '')}
              theme="vs-light"
              options={{
                fontSize: 14, fontFamily: "'JetBrains Mono', monospace", minimap: { enabled: false },
                padding: { top: 16 }, scrollBeyondLastLine: false, automaticLayout: true,
              }}
            />
          </div>

          {/* Input / Output Tabs */}
          <div className="bg-white rounded-[16px] p-4 shadow-sm" style={{ border: '1px solid var(--gray-200)', minHeight: 160 }}>
            <div className="flex gap-3 mb-3">
              <button onClick={() => setActiveTab('input')}
                className="text-xs font-bold uppercase tracking-wider pb-1"
                style={{ color: activeTab === 'input' ? 'var(--blue-600)' : 'var(--gray-400)', borderBottom: activeTab === 'input' ? '2px solid var(--blue-600)' : 'none' }}>
                Input
              </button>
              <button onClick={() => setActiveTab('output')}
                className="text-xs font-bold uppercase tracking-wider pb-1"
                style={{ color: activeTab === 'output' ? 'var(--blue-600)' : 'var(--gray-400)', borderBottom: activeTab === 'output' ? '2px solid var(--blue-600)' : 'none' }}>
                Output
              </button>
            </div>
            {activeTab === 'input' ? (
              <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="Custom input (stdin)..."
                className="input-light !min-h-[80px] !text-sm font-mono resize-y" />
            ) : (
              <pre className="text-sm font-mono p-3 rounded-lg whitespace-pre-wrap" style={{
                background: result?.status === 'Accepted' ? '#f0fdf4' : (output.startsWith('❌') || output.startsWith('⚠')) ? '#fef2f2' : 'var(--gray-50)',
                color: result?.status === 'Accepted' ? '#16a34a' : (output.startsWith('❌') || output.startsWith('⚠')) ? '#dc2626' : 'var(--gray-700)',
                border: `1px solid ${result?.status === 'Accepted' ? '#bbf7d0' : (output.startsWith('❌') || output.startsWith('⚠')) ? '#fecaca' : 'var(--gray-200)'}`,
                minHeight: 80,
              }}>{output || 'Run your code to see output here...'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemSolve;
