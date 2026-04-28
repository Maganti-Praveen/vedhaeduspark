import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { quizAPI, courseAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_Q = { question: '', options: ['', '', '', ''], correctAnswer: 0, explanation: '' };

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', courseId: '', duration: 15, passingScore: 60, isActive: true, questions: [{ ...EMPTY_Q }] });

  useEffect(() => {
    Promise.all([quizAPI.getAdmin(), courseAPI.getAll()]).then(([q, c]) => {
      setQuizzes(q.data); setCourses(c.data); setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const load = () => quizAPI.getAdmin().then(({ data }) => setQuizzes(data));

  const startCreate = () => { setEditId(null); setForm({ title: '', description: '', courseId: '', duration: 15, passingScore: 60, isActive: true, questions: [{ ...EMPTY_Q, options: ['', '', '', ''] }] }); setShowForm(true); };
  const startEdit = (q) => { setEditId(q._id); setForm({ title: q.title, description: q.description || '', courseId: q.courseId?._id || '', duration: q.duration, passingScore: q.passingScore, isActive: q.isActive, questions: q.questions.map(qq => ({ ...qq, options: [...qq.options] })) }); setShowForm(true); };

  const updateQ = (qi, field, val) => { const qs = [...form.questions]; qs[qi] = { ...qs[qi], [field]: val }; setForm({ ...form, questions: qs }); };
  const updateOpt = (qi, oi, val) => { const qs = [...form.questions]; qs[qi].options[oi] = val; setForm({ ...form, questions: qs }); };
  const addQ = () => setForm({ ...form, questions: [...form.questions, { ...EMPTY_Q, options: ['', '', '', ''] }] });
  const removeQ = (qi) => { if (form.questions.length <= 1) return; const qs = form.questions.filter((_, i) => i !== qi); setForm({ ...form, questions: qs }); };

  const handleSave = async () => {
    if (!form.title) return toast.error('Title required');
    if (form.questions.some(q => !q.question || q.options.some(o => !o))) return toast.error('Fill all questions and options');
    try {
      const data = { ...form, courseId: form.courseId || null };
      if (editId) await quizAPI.update(editId, data);
      else await quizAPI.create(data);
      toast.success(editId ? 'Updated!' : 'Created!');
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try { await quizAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  if (showForm) {
    return (
      <div className="space-y-5 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--gray-900)' }}>{editId ? 'Edit' : 'Create'} Quiz</h2>
          <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100"><HiX /></button>
        </div>

        <div className="space-y-4 bg-white p-5 rounded-[16px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light !text-sm" placeholder="Quiz title..." />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Course (optional)</label>
              <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} className="input-light !text-sm">
                <option value="">— General Quiz —</option>
                {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Description</label>
            <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-light !text-sm" placeholder="Brief description..." />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Duration (min)</label>
              <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: Number(e.target.value) })} className="input-light !text-sm" min="1" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Pass Score (%)</label>
              <input type="number" value={form.passingScore} onChange={e => setForm({ ...form, passingScore: Number(e.target.value) })} className="input-light !text-sm" min="1" max="100" />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-600" />
                <span className="text-sm font-semibold" style={{ color: 'var(--gray-700)' }}>Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>Questions ({form.questions.length})</h3>
            <button onClick={addQ} className="btn-primary !py-1.5 !px-3 !text-xs"><HiPlus /> Add Question</button>
          </div>
          {form.questions.map((q, qi) => (
            <div key={qi} className="bg-white p-4 rounded-[16px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold" style={{ color: 'var(--blue-600)' }}>Q{qi + 1}</span>
                <button onClick={() => removeQ(qi)} className="p-1 text-red-400 hover:bg-red-50 rounded"><HiTrash /></button>
              </div>
              <input value={q.question} onChange={e => updateQ(qi, 'question', e.target.value)} className="input-light !text-sm mb-3" placeholder="Enter question..." />
              <div className="grid grid-cols-2 gap-2 mb-3">
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === oi} onChange={() => updateQ(qi, 'correctAnswer', oi)} className="accent-green-600" />
                    <input value={opt} onChange={e => updateOpt(qi, oi, e.target.value)} className="input-light !text-xs !py-1.5 flex-1"
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                      style={{ borderColor: q.correctAnswer === oi ? '#16a34a' : undefined }} />
                  </div>
                ))}
              </div>
              <input value={q.explanation} onChange={e => updateQ(qi, 'explanation', e.target.value)} className="input-light !text-xs !py-1.5" placeholder="Explanation (shown after submit)..." />
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary !py-2.5 !px-8">{editId ? 'Update' : 'Create'} Quiz</button>
          <button onClick={() => setShowForm(false)} className="btn-outline !py-2.5 !px-6">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>📝 Quiz Management</h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Create and manage assessments</p>
        </div>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5"><HiPlus /> Create Quiz</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <p style={{ color: 'var(--gray-500)' }}>No quizzes yet. Create one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q, i) => (
            <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              className="bg-white p-4 rounded-[16px] shadow-sm flex items-center justify-between" style={{ border: '1px solid var(--gray-200)' }}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>{q.title}</h3>
                  <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{
                    background: q.isActive ? '#dcfce7' : '#fee2e2', color: q.isActive ? '#16a34a' : '#ef4444'
                  }}>{q.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <div className="text-xs" style={{ color: 'var(--gray-400)' }}>
                  {q.questions?.length} questions • {q.duration} min • Pass: {q.passingScore}%
                  {q.courseId && <span> • 📚 {q.courseId.title}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(q)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }}><HiPencil /></button>
                <button onClick={() => handleDelete(q._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
