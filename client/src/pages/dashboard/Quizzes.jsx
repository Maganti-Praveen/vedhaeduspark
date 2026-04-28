import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaClock, FaCheckCircle, FaTimesCircle, FaRedo, FaPlay } from 'react-icons/fa';
import { quizAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05 } }) };

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    quizAPI.getAll().then(({ data }) => { setQuizzes(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Timer
  useEffect(() => {
    if (!activeQuiz || result) return;
    if (timeLeft <= 0) { handleSubmit(); return; }
    const t = setTimeout(() => setTimeLeft(p => p - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, activeQuiz, result]);

  const startQuiz = async (quiz) => {
    try {
      const { data } = await quizAPI.getById(quiz._id);
      setActiveQuiz(data);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(-1));
      setCurrent(0);
      setTimeLeft(data.duration * 60);
      setStartTime(Date.now());
      setResult(null);
    } catch { toast.error('Failed to load quiz'); }
  };

  const selectAnswer = (idx) => { const a = [...answers]; a[current] = idx; setAnswers(a); };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.round((Date.now() - startTime) / 1000);
      const { data } = await quizAPI.submit(activeQuiz._id, { answers, timeTaken });
      setResult(data);
    } catch { toast.error('Submit failed'); }
    setSubmitting(false);
  };

  const exitQuiz = () => { setActiveQuiz(null); setResult(null); quizAPI.getAll().then(({ data }) => setQuizzes(data)); };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ======= RESULT SCREEN =======
  if (result) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8 rounded-[20px] bg-white shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="text-6xl mb-3">{result.passed ? '🎉' : '😢'}</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: result.passed ? '#16a34a' : '#ef4444' }}>
            {result.passed ? 'Congratulations!' : 'Keep Trying!'}
          </h2>
          <div className="flex items-center justify-center gap-6 my-5">
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: 'var(--blue-600)' }}>{result.correct}/{result.total}</div>
              <div className="text-xs" style={{ color: 'var(--gray-400)' }}>Correct</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold" style={{ color: result.passed ? '#16a34a' : '#ef4444' }}>{result.percentage}%</div>
              <div className="text-xs" style={{ color: 'var(--gray-400)' }}>Score</div>
            </div>
          </div>
          <span className="px-4 py-1.5 rounded-full text-sm font-bold" style={{
            background: result.passed ? '#dcfce7' : '#fee2e2', color: result.passed ? '#16a34a' : '#ef4444'
          }}>{result.passed ? 'PASSED ✓' : 'FAILED ✗'}</span>
        </motion.div>

        {/* Answer Review */}
        <div className="space-y-3">
          {result.results.map((r, i) => (
            <div key={i} className="bg-white p-4 rounded-[16px] shadow-sm" style={{ border: `1px solid ${r.isCorrect ? '#bbf7d0' : '#fecaca'}` }}>
              <div className="flex items-start gap-2 mb-2">
                {r.isCorrect ? <FaCheckCircle className="text-green-500 mt-0.5" /> : <FaTimesCircle className="text-red-500 mt-0.5" />}
                <p className="text-sm font-semibold" style={{ color: 'var(--gray-800)' }}>{i + 1}. {r.question}</p>
              </div>
              <div className="ml-6 space-y-1">
                {r.options.map((opt, j) => (
                  <div key={j} className="text-xs px-3 py-1.5 rounded-lg" style={{
                    background: j === r.correct ? '#dcfce7' : j === r.selected && !r.isCorrect ? '#fee2e2' : 'var(--gray-50)',
                    color: j === r.correct ? '#16a34a' : j === r.selected && !r.isCorrect ? '#ef4444' : 'var(--gray-600)',
                    fontWeight: j === r.correct || j === r.selected ? 700 : 400,
                  }}>{opt} {j === r.correct && '✓'} {j === r.selected && j !== r.correct && '✗'}</div>
                ))}
                {r.explanation && <p className="text-[0.65rem] mt-2 italic" style={{ color: 'var(--gray-400)' }}>💡 {r.explanation}</p>}
              </div>
            </div>
          ))}
        </div>
        <button onClick={exitQuiz} className="btn-primary w-full !py-3">← Back to Quizzes</button>
      </div>
    );
  }

  // ======= QUIZ TAKING =======
  if (activeQuiz && questions.length > 0) {
    const q = questions[current];
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="font-bold" style={{ color: 'var(--gray-900)' }}>{activeQuiz.title}</h2>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm" style={{
            background: timeLeft < 60 ? '#fee2e2' : 'var(--gray-100)', color: timeLeft < 60 ? '#ef4444' : 'var(--gray-700)'
          }}><FaClock /> {fmtTime(timeLeft)}</div>
        </div>

        {/* Progress */}
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} onClick={() => setCurrent(i)} className="flex-1 h-2 rounded-full cursor-pointer transition-all" style={{
              background: answers[i] >= 0 ? (i === current ? 'var(--blue-600)' : '#93c5fd') : (i === current ? 'var(--gray-400)' : 'var(--gray-200)')
            }} />
          ))}
        </div>

        {/* Question */}
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--blue-600)' }}>Question {current + 1} of {questions.length}</p>
          <h3 className="text-lg font-bold mb-5" style={{ color: 'var(--gray-900)' }}>{q.question}</h3>
          <div className="space-y-3">
            {q.options.map((opt, j) => (
              <button key={j} onClick={() => selectAnswer(j)}
                className="w-full text-left px-5 py-3.5 rounded-xl text-sm font-medium transition-all"
                style={{
                  border: answers[current] === j ? '2px solid var(--blue-600)' : '1px solid var(--gray-200)',
                  background: answers[current] === j ? 'var(--blue-50)' : 'var(--white)',
                  color: answers[current] === j ? 'var(--blue-700)' : 'var(--gray-700)',
                }}>
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mr-3" style={{
                  background: answers[current] === j ? 'var(--blue-600)' : 'var(--gray-200)',
                  color: answers[current] === j ? '#fff' : 'var(--gray-500)',
                }}>{String.fromCharCode(65 + j)}</span>
                {opt}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Nav */}
        <div className="flex gap-3">
          {current > 0 && <button onClick={() => setCurrent(p => p - 1)} className="btn-outline !py-2.5 flex-1">← Previous</button>}
          {current < questions.length - 1 ? (
            <button onClick={() => setCurrent(p => p + 1)} className="btn-primary !py-2.5 flex-1">Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary !py-2.5 flex-1 disabled:opacity-50">
              {submitting ? 'Submitting...' : '✅ Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ======= QUIZ LIST =======
  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>📝 Quizzes & Assessments</h1>
        <p style={{ color: 'var(--gray-500)' }}>Test your knowledge and earn points</p>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-40 rounded-[16px]" />)}</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="text-5xl mb-3">📝</div>
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No quizzes available yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {quizzes.map((q, i) => (
            <motion.div key={q._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
              className="bg-white rounded-[16px] p-5 shadow-sm hover:shadow-md transition-all" style={{ border: '1px solid var(--gray-200)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>{q.title}</h3>
                {q.lastAttempt && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                    background: q.lastAttempt.passed ? '#dcfce7' : '#fee2e2',
                    color: q.lastAttempt.passed ? '#16a34a' : '#ef4444',
                  }}>{q.lastAttempt.passed ? `✓ ${q.lastAttempt.percentage}%` : `✗ ${q.lastAttempt.percentage}%`}</span>
                )}
              </div>
              {q.description && <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--gray-500)' }}>{q.description}</p>}
              {q.courseId && <p className="text-[0.65rem] mb-3" style={{ color: 'var(--blue-500)' }}>📚 {q.courseId.title}</p>}
              <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--gray-400)' }}>
                <span>{q.questions?.length || 0} questions</span>
                <span><FaClock className="inline" /> {q.duration} min</span>
                <span>Pass: {q.passingScore}%</span>
              </div>
              <button onClick={() => startQuiz(q)} className="w-full py-2.5 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5" style={{ background: 'var(--gradient-blue)' }}>
                {q.lastAttempt ? <><FaRedo /> Retake Quiz</> : <><FaPlay /> Start Quiz</>}
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quizzes;
