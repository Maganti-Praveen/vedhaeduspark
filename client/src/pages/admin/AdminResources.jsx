import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { resourceAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['DSA', 'DBMS', 'OS', 'CN', 'Web Dev', 'Mobile Dev', 'AI/ML', 'Cloud', 'DevOps', 'Interview Prep', 'Other'];
const TYPES = ['article', 'video', 'github', 'tool', 'course', 'other'];
const ICONS = ['📚', '🧮', '🗄️', '⚙️', '🌐', '💻', '🤖', '☁️', '🔧', '🎯', '📝'];

const EMPTY = { title: '', url: '', category: 'DSA', type: 'article', description: '', icon: '📚' };

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = () => { setLoading(true); resourceAPI.getAll().then(({ data }) => { setResources(data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const startCreate = () => { setEditId(null); setForm({ ...EMPTY }); setShowForm(true); };
  const startEdit = (r) => { setEditId(r._id); setForm({ title: r.title, url: r.url, category: r.category, type: r.type, description: r.description || '', icon: r.icon || '📚' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title || !form.url) return toast.error('Title and URL required');
    try {
      if (editId) { await resourceAPI.update(editId, form); toast.success('Updated!'); }
      else { await resourceAPI.create(form); toast.success('Resource added!'); }
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await resourceAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Manage Resources</h1>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5 !text-sm"><HiPlus /> Add Resource</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[20px] p-6 w-full max-w-lg shadow-2xl" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>{editId ? 'Edit' : 'Add'} Resource</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><HiX /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light !text-sm" placeholder="Resource title" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>URL *</label>
                <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} className="input-light !text-sm" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-light !text-sm cursor-pointer">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-light !text-sm cursor-pointer">
                    {TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Icon</label>
                <div className="flex gap-2 flex-wrap">
                  {ICONS.map(ic => (
                    <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all"
                      style={{ border: form.icon === ic ? '2px solid var(--blue-600)' : '2px solid var(--gray-200)', background: form.icon === ic ? 'var(--blue-50)' : 'white' }}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className="input-light !text-sm resize-y" placeholder="Optional description..." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-primary !py-2.5 !px-6 !text-sm">{editId ? 'Update' : 'Add'}</button>
                <button onClick={() => setShowForm(false)} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Resource</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Category</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Type</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {resources.map(r => (
                <tr key={r._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span>{r.icon}</span>
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{r.title}</div>
                        <div className="text-xs truncate max-w-[200px]" style={{ color: 'var(--gray-400)' }}>{r.url}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="badge-blue text-xs">{r.category}</span></td>
                  <td className="py-3 px-4 text-xs capitalize" style={{ color: 'var(--gray-600)' }}>{r.type}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(r)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }}><HiPencil /></button>
                    <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {resources.length === 0 && <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No resources yet.</div>}
      </div>
    </div>
  );
};

export default AdminResources;
