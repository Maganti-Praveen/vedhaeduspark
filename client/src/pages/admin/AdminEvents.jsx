import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiPencil, HiX } from 'react-icons/hi';
import { eventAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const TYPES = ['Webinar', 'Workshop', 'Hackathon', 'Seminar', 'Meetup', 'Other'];

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'Webinar', date: '', time: '', duration: '1 hour', speaker: '', link: '', image: '', isActive: true });

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); eventAPI.getAdmin().then(({ data }) => { setEvents(data); setLoading(false); }).catch(() => setLoading(false)); };

  const startCreate = () => { setEditId(null); setForm({ title: '', description: '', type: 'Webinar', date: '', time: '', duration: '1 hour', speaker: '', link: '', image: '', isActive: true }); setShowForm(true); };
  const startEdit = (e) => { setEditId(e._id); setForm({ title: e.title, description: e.description, type: e.type, date: e.date?.slice(0, 10) || '', time: e.time, duration: e.duration || '1 hour', speaker: e.speaker || '', link: e.link || '', image: e.image || '', isActive: e.isActive }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title || !form.date || !form.time) return toast.error('Title, date, and time required');
    try {
      if (editId) await eventAPI.update(editId, form);
      else await eventAPI.create(form);
      toast.success(editId ? 'Updated!' : 'Created!');
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try { await eventAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  if (showForm) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--gray-900)' }}>{editId ? 'Edit' : 'Create'} Event</h2>
          <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100"><HiX /></button>
        </div>
        <div className="bg-white p-5 rounded-[16px] shadow-sm space-y-4" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light !text-sm" placeholder="Event title..." /></div>
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-light !text-sm">
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select></div>
          </div>
          <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-light !text-sm resize-y" placeholder="Event description..." /></div>
          <div className="grid grid-cols-3 gap-4">
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Date *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input-light !text-sm" /></div>
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Time *</label>
              <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} className="input-light !text-sm" /></div>
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Duration</label>
              <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-light !text-sm" placeholder="1 hour" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Speaker</label>
              <input value={form.speaker} onChange={e => setForm({ ...form, speaker: e.target.value })} className="input-light !text-sm" placeholder="Speaker name..." /></div>
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Join Link</label>
              <input value={form.link} onChange={e => setForm({ ...form, link: e.target.value })} className="input-light !text-sm" placeholder="https://meet.google.com/..." /></div>
          </div>
          <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Image</label>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={async (e) => {
                const file = e.target.files?.[0]; if (!file) return;
                try { const { data } = await uploadAPI.image(file); setForm(f => ({ ...f, image: data.url })); toast.success('Uploaded!'); }
                catch { toast.error('Upload failed'); }
              }} className="input-light !text-sm !py-1.5 flex-1" />
              {form.image && <img src={form.image} className="w-12 h-12 rounded-lg object-cover" />}
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-600" />
            <span className="text-sm font-semibold" style={{ color: 'var(--gray-700)' }}>Active</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary !py-2.5 !px-8">{editId ? 'Update' : 'Create'} Event</button>
          <button onClick={() => setShowForm(false)} className="btn-outline !py-2.5 !px-6">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>🎯 Event Management</h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Create and manage events & webinars</p>
        </div>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5"><HiPlus /> Create Event</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <p style={{ color: 'var(--gray-500)' }}>No events yet. Create one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((e, i) => (
            <motion.div key={e._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              className="bg-white p-4 rounded-[16px] shadow-sm flex items-center justify-between" style={{ border: '1px solid var(--gray-200)' }}>
              <div className="flex items-center gap-3">
                {e.image && <img src={e.image} className="w-12 h-12 rounded-lg object-cover" />}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>{e.title}</h3>
                    <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#2563eb' }}>{e.type}</span>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--gray-400)' }}>
                    {new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at {e.time} • {e.registeredUsers?.length || 0} registered
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(e)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }}><HiPencil /></button>
                <button onClick={() => handleDelete(e._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
