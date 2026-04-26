import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { jobAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Software Development', 'Data Science', 'Web Development', 'Mobile Development', 'DevOps', 'Cybersecurity', 'AI/ML', 'Cloud Computing', 'Database', 'Internship', 'Other'];
const TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];

const EMPTY = { title: '', company: '', role: '', category: 'Software Development', type: 'Full-time', location: 'Remote', experience: 'Fresher', salary: '', description: '', requirements: '', link: '', deadline: '' };

const AdminJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });

  const load = () => { setLoading(true); jobAPI.getAll().then(({ data }) => { setJobs(data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const startCreate = () => { setEditId(null); setForm({ ...EMPTY }); setShowForm(true); };
  const startEdit = (j) => { setEditId(j._id); setForm({ title: j.title, company: j.company, role: j.role, category: j.category, type: j.type, location: j.location || '', experience: j.experience || '', salary: j.salary || '', description: j.description, requirements: j.requirements || '', link: j.link, deadline: j.deadline ? j.deadline.slice(0, 10) : '' }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title || !form.company || !form.role || !form.description || !form.link) return toast.error('Fill all required fields');
    try {
      if (editId) { await jobAPI.update(editId, form); toast.success('Updated!'); }
      else { await jobAPI.create(form); toast.success('Job posted!'); }
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete this job?')) return; try { await jobAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Manage Jobs</h1>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5 !text-sm"><HiPlus /> Post Job</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[20px] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>{editId ? 'Edit' : 'Post New'} Job</h3>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100"><HiX /></button>
            </div>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Title *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light !text-sm" placeholder="e.g. Frontend Developer" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Company *</label>
                  <input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="input-light !text-sm" placeholder="e.g. Google" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Role *</label>
                  <input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="input-light !text-sm" placeholder="e.g. SDE-1" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Category *</label>
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
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Location</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-light !text-sm" placeholder="e.g. Bangalore / Remote" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Experience</label>
                  <input value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="input-light !text-sm" placeholder="e.g. 0-2 years / Fresher" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Salary</label>
                  <input value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} className="input-light !text-sm" placeholder="e.g. ₹6-10 LPA" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Apply Link *</label>
                  <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="input-light !text-sm" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Deadline</label>
                  <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} className="input-light !text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-light !text-sm resize-y" placeholder="Job description..." />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Requirements</label>
                <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} rows={2} className="input-light !text-sm resize-y" placeholder="Skills required..." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSave} className="btn-primary !py-2.5 !px-6 !text-sm">{editId ? 'Update' : 'Post'} Job</button>
                <button onClick={() => setShowForm(false)} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Job</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Category</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Type</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{j.title}</div>
                    <div className="text-xs" style={{ color: 'var(--gray-400)' }}>{j.company} • {j.role}</div>
                  </td>
                  <td className="py-3 px-4"><span className="badge-blue text-xs">{j.category}</span></td>
                  <td className="py-3 px-4 text-xs" style={{ color: 'var(--gray-600)' }}>{j.type}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(j)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }}><HiPencil /></button>
                    <button onClick={() => handleDelete(j._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {jobs.length === 0 && <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No jobs posted yet.</div>}
      </div>
    </div>
  );
};

export default AdminJobs;
