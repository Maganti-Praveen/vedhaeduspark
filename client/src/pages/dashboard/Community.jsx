import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HiChatAlt2, HiHeart, HiReply, HiSearch, HiPlus, HiX, HiTrash } from 'react-icons/hi';
import { discussionAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }) };
const typeColors = { general: { bg: '#ede9fe', color: '#7c3aed' }, course: { bg: '#dbeafe', color: '#2563eb' }, problem: { bg: '#dcfce7', color: '#16a34a' } };

const Community = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ title: '', content: '', type: 'general', tags: '' });
  const [replyText, setReplyText] = useState('');

  const fetchAll = () => {
    const params = {};
    if (filter) params.type = filter;
    if (search) params.search = search;
    discussionAPI.getAll(params).then(({ data }) => { setDiscussions(data); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, [filter, search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) return toast.error('Fill title and content');
    try {
      await discussionAPI.create({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
      setShowCreate(false); setForm({ title: '', content: '', type: 'general', tags: '' }); fetchAll();
      toast.success('Discussion created!');
    } catch { toast.error('Failed to create'); }
  };

  const handleLike = async (id) => {
    try {
      const { data } = await discussionAPI.like(id);
      setDiscussions(prev => prev.map(d => d._id === id ? { ...d, likes: data.liked ? [...d.likes, user._id] : d.likes.filter(l => l !== user._id) } : d));
      if (selected?._id === id) setSelected(prev => ({ ...prev, likes: data.liked ? [...prev.likes, user._id] : prev.likes.filter(l => l !== user._id) }));
    } catch { }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const { data } = await discussionAPI.reply(selected._id, { content: replyText });
      setSelected(data); setReplyText(''); fetchAll();
    } catch { toast.error('Failed to reply'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this discussion?')) return;
    try {
      await discussionAPI.delete(id);
      setSelected(null); fetchAll(); toast.success('Deleted');
    } catch { toast.error('Cannot delete'); }
  };

  const timeAgo = (d) => { const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return 'now'; if (s < 3600) return `${Math.floor(s / 60)}m`; if (s < 86400) return `${Math.floor(s / 3600)}h`; return `${Math.floor(s / 86400)}d`; };

  // Thread View
  if (selected) return (
    <div className="space-y-4">
      <button onClick={() => setSelected(null)} className="text-sm font-medium flex items-center gap-1" style={{ color: 'var(--blue-600)' }}>← Back to discussions</button>
      <div className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ ...typeColors[selected.type] }}>{selected.type}</span>
              {selected.tags?.map((t, i) => <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>#{t}</span>)}
            </div>
            <h2 className="text-xl font-bold" style={{ color: 'var(--gray-900)' }}>{selected.title}</h2>
          </div>
          {(selected.author?._id === user?._id || user?.role === 'admin') && (
            <button onClick={() => handleDelete(selected._id)} className="p-2 rounded-lg hover:bg-red-50" style={{ color: '#ef4444' }}><HiTrash /></button>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--gray-400)' }}>
          <span className="font-semibold" style={{ color: 'var(--gray-600)' }}>{selected.author?.name}</span> • {timeAgo(selected.createdAt)} ago
        </div>
        <div className="mt-4 text-sm whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--gray-700)' }}>{selected.content}</div>
        <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--gray-100)' }}>
          <button onClick={() => handleLike(selected._id)} className="flex items-center gap-1 text-sm font-medium transition-colors"
            style={{ color: selected.likes?.includes(user?._id) ? '#ef4444' : 'var(--gray-400)' }}>
            <HiHeart /> {selected.likes?.length || 0}
          </button>
          <span className="text-sm" style={{ color: 'var(--gray-400)' }}><HiReply className="inline" /> {selected.replies?.length || 0} replies</span>
        </div>
      </div>

      {/* Replies */}
      <div className="space-y-3">
        {selected.replies?.map((r, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}
            className="bg-white rounded-[14px] p-4 shadow-sm ml-6" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="flex items-center gap-2 text-xs mb-2">
              <span className="font-semibold" style={{ color: 'var(--gray-700)' }}>{r.author?.name}</span>
              <span style={{ color: 'var(--gray-400)' }}>• {timeAgo(r.createdAt)} ago</span>
            </div>
            <p className="text-sm whitespace-pre-wrap" style={{ color: 'var(--gray-600)' }}>{r.content}</p>
          </motion.div>
        ))}
      </div>

      {/* Reply Box */}
      <div className="flex gap-2">
        <input value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." className="input-light flex-1 !text-sm"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(); } }} />
        <button onClick={handleReply} className="btn-primary !py-2 !px-5 !text-sm">Reply</button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>💬 Community</h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Ask questions, share knowledge, help others</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary !py-2.5 !px-5 !text-sm"><HiPlus /> New Discussion</button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-400)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search discussions..."
            className="input-light !pl-9 !py-2 !text-sm" />
        </div>
        {['', 'general', 'course', 'problem'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ background: filter === f ? 'var(--blue-600)' : 'var(--gray-100)', color: filter === f ? '#fff' : 'var(--gray-500)' }}>
            {f || 'All'}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-[16px]" />)}</div>
      ) : discussions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <HiChatAlt2 className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No discussions yet. Start one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {discussions.map((d, i) => (
            <motion.div key={d._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
              onClick={() => setSelected(d)}
              className="bg-white rounded-[16px] p-5 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: '1px solid var(--gray-200)' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[0.6rem] font-semibold px-2 py-0.5 rounded-full" style={{ ...typeColors[d.type] }}>{d.type}</span>
                    {d.isPinned && <span className="text-[0.6rem]">📌</span>}
                  </div>
                  <h3 className="font-bold text-sm truncate" style={{ color: 'var(--gray-900)' }}>{d.title}</h3>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--gray-500)' }}>{d.content}</p>
                </div>
                <div className="flex flex-col items-end gap-1 text-xs flex-shrink-0" style={{ color: 'var(--gray-400)' }}>
                  <span>{timeAgo(d.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-0.5"><HiHeart style={{ color: d.likes?.includes(user?._id) ? '#ef4444' : 'inherit' }} /> {d.likes?.length || 0}</span>
                    <span className="flex items-center gap-0.5"><HiReply /> {d.replies?.length || 0}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-medium" style={{ color: 'var(--gray-600)' }}>{d.author?.name}</span>
                {d.tags?.map((t, j) => <span key={j} className="text-[0.6rem] px-1.5 py-0.5 rounded" style={{ background: 'var(--gray-100)', color: 'var(--gray-400)' }}>#{t}</span>)}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[20px] p-6 w-full max-w-lg shadow-2xl" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>New Discussion</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-lg hover:bg-gray-100"><HiX /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Title" className="input-light" />
              <textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="What's on your mind?" className="input-light !min-h-[100px] resize-y" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-light cursor-pointer">
                  <option value="general">General</option>
                  <option value="course">Course</option>
                  <option value="problem">Problem</option>
                </select>
                <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Tags (comma separated)" className="input-light" />
              </div>
              <button type="submit" className="btn-primary w-full">Post Discussion</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Community;
