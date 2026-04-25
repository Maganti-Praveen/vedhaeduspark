import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiPencil } from 'react-icons/hi';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { problemAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_TC = { input: '', output: '' };

const AdminProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: '', difficulty: 'Easy', topic: '', description: '', inputFormat: '', outputFormat: '', constraints: '',
    sampleTestCases: [{ ...EMPTY_TC, explanation: '' }], hiddenTestCases: [{ ...EMPTY_TC }],
  });

  const load = () => { setLoading(true); problemAPI.getAll().then(({ data }) => { setProblems(data.problems || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const startCreate = () => {
    setEditId(null);
    setForm({ title: '', difficulty: 'Easy', topic: '', description: '', inputFormat: '', outputFormat: '', constraints: '',
      sampleTestCases: [{ input: '', output: '', explanation: '' }], hiddenTestCases: [{ input: '', output: '' }] });
    setShowForm(true);
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setForm({
      title: p.title, difficulty: p.difficulty, topic: p.topic, description: p.description,
      inputFormat: p.inputFormat || '', outputFormat: p.outputFormat || '', constraints: p.constraints || '',
      sampleTestCases: p.sampleTestCases?.length ? p.sampleTestCases : [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: p.hiddenTestCases?.length ? p.hiddenTestCases : [{ input: '', output: '' }],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.topic) return toast.error('Title, description and topic required');
    const cleanSample = form.sampleTestCases.filter(t => t.input && t.output);
    const cleanHidden = form.hiddenTestCases.filter(t => t.input && t.output);
    if (cleanSample.length === 0) return toast.error('Add at least 1 sample test case');
    try {
      const payload = { ...form, sampleTestCases: cleanSample, hiddenTestCases: cleanHidden };
      if (editId) { await problemAPI.update(editId, payload); toast.success('Updated!'); }
      else { await problemAPI.create(payload); toast.success('Created!'); }
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete this problem?')) return; try { await problemAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  const updateTC = (type, idx, key, val) => {
    setForm(f => { const arr = [...f[type]]; arr[idx] = { ...arr[idx], [key]: val }; return { ...f, [type]: arr }; });
  };
  const addTC = (type) => setForm(f => ({ ...f, [type]: [...f[type], type === 'sampleTestCases' ? { input: '', output: '', explanation: '' } : { input: '', output: '' }] }));
  const removeTC = (type, idx) => setForm(f => ({ ...f, [type]: f[type].filter((_, i) => i !== idx) }));

  const diffColor = { Easy: { bg: '#dcfce7', color: '#16a34a' }, Medium: { bg: '#fef3c7', color: '#f59e0b' }, Hard: { bg: '#fee2e2', color: '#ef4444' } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Manage Problems</h1>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5 !text-sm"><HiPlus /> Add Problem</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[16px] p-6 shadow-sm space-y-5" style={{ border: '1px solid var(--gray-200)' }}>
          <h2 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>{editId ? 'Edit' : 'Create'} Problem</h2>

          {/* Details */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--gray-50)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--blue-600)' }}>Problem Details</div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light !text-sm" placeholder="e.g. Two Sum" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value })} className="input-light !text-sm cursor-pointer">
                  <option>Easy</option><option>Medium</option><option>Hard</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Topic *</label>
                <input value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })} className="input-light !text-sm" placeholder="e.g. Arrays, Strings, Trees" />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Description * (Markdown supported)</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} className="input-light !text-sm resize-y font-mono" placeholder="Problem statement..." />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Input Format</label>
                <textarea value={form.inputFormat} onChange={e => setForm({ ...form, inputFormat: e.target.value })} rows={2} className="input-light !text-xs resize-y font-mono" placeholder="Describe input format..." />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Output Format</label>
                <textarea value={form.outputFormat} onChange={e => setForm({ ...form, outputFormat: e.target.value })} rows={2} className="input-light !text-xs resize-y font-mono" placeholder="Describe output format..." />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Constraints</label>
                <textarea value={form.constraints} onChange={e => setForm({ ...form, constraints: e.target.value })} rows={2} className="input-light !text-xs resize-y font-mono" placeholder="e.g. 1 <= n <= 10^5" />
              </div>
            </div>
          </div>

          {/* Sample Test Cases */}
          <div className="p-4 rounded-xl" style={{ background: '#f0fdf4' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaEye className="text-sm" style={{ color: '#16a34a' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#16a34a' }}>Sample Test Cases (Visible to users)</span>
              </div>
              <button onClick={() => addTC('sampleTestCases')} className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: '#dcfce7', color: '#16a34a' }}>+ Add</button>
            </div>
            <div className="space-y-3">
              {form.sampleTestCases.map((tc, i) => (
                <div key={i} className="bg-white rounded-lg p-3 space-y-2" style={{ border: '1px solid #bbf7d0' }}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold" style={{ color: '#16a34a' }}>Test #{i + 1}</span>
                    {form.sampleTestCases.length > 1 && <button onClick={() => removeTC('sampleTestCases', i)} className="text-red-400 text-sm hover:text-red-600"><HiTrash /></button>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[0.65rem] font-semibold block mb-0.5" style={{ color: 'var(--gray-500)' }}>Input</label>
                      <textarea value={tc.input} onChange={e => updateTC('sampleTestCases', i, 'input', e.target.value)} rows={2} className="input-light !text-xs !py-1.5 font-mono resize-y" placeholder="Input..." />
                    </div>
                    <div>
                      <label className="text-[0.65rem] font-semibold block mb-0.5" style={{ color: 'var(--gray-500)' }}>Expected Output</label>
                      <textarea value={tc.output} onChange={e => updateTC('sampleTestCases', i, 'output', e.target.value)} rows={2} className="input-light !text-xs !py-1.5 font-mono resize-y" placeholder="Output..." />
                    </div>
                  </div>
                  <div>
                    <label className="text-[0.65rem] font-semibold block mb-0.5" style={{ color: 'var(--gray-500)' }}>Explanation (optional)</label>
                    <input value={tc.explanation || ''} onChange={e => updateTC('sampleTestCases', i, 'explanation', e.target.value)} className="input-light !text-xs !py-1.5" placeholder="Why this output..." />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hidden Test Cases */}
          <div className="p-4 rounded-xl" style={{ background: '#fef2f2' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FaEyeSlash className="text-sm" style={{ color: '#ef4444' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#ef4444' }}>Hidden Test Cases (NOT visible)</span>
              </div>
              <button onClick={() => addTC('hiddenTestCases')} className="text-xs font-semibold px-3 py-1 rounded-lg" style={{ background: '#fee2e2', color: '#ef4444' }}>+ Add</button>
            </div>
            <div className="space-y-3">
              {form.hiddenTestCases.map((tc, i) => (
                <div key={i} className="bg-white rounded-lg p-3" style={{ border: '1px solid #fecaca' }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold" style={{ color: '#ef4444' }}>Hidden #{i + 1}</span>
                    {form.hiddenTestCases.length > 1 && <button onClick={() => removeTC('hiddenTestCases', i)} className="text-red-400 text-sm hover:text-red-600"><HiTrash /></button>}
                  </div>
                  <div className="grid md:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[0.65rem] font-semibold block mb-0.5" style={{ color: 'var(--gray-500)' }}>Input</label>
                      <textarea value={tc.input} onChange={e => updateTC('hiddenTestCases', i, 'input', e.target.value)} rows={2} className="input-light !text-xs !py-1.5 font-mono resize-y" placeholder="Input..." />
                    </div>
                    <div>
                      <label className="text-[0.65rem] font-semibold block mb-0.5" style={{ color: 'var(--gray-500)' }}>Expected Output</label>
                      <textarea value={tc.output} onChange={e => updateTC('hiddenTestCases', i, 'output', e.target.value)} rows={2} className="input-light !text-xs !py-1.5 font-mono resize-y" placeholder="Output..." />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary !py-2.5 !px-6 !text-sm">{editId ? 'Update' : 'Create'} Problem</button>
            <button onClick={() => setShowForm(false)} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Problem</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Difficulty</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Topic</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Tests</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {problems.map(p => (
                <tr key={p._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{p.title}</td>
                  <td className="py-3 px-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={diffColor[p.difficulty]}>{p.difficulty}</span></td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--gray-500)' }}>{p.topic}</td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--gray-500)' }}>{p.sampleTestCases?.length || 0} sample</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(p)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }}><HiPencil /></button>
                    <button onClick={() => handleDelete(p._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {problems.length === 0 && <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No problems yet.</div>}
      </div>
    </div>
  );
};

export default AdminProblems;
