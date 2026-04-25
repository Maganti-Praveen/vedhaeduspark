import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiBookOpen, HiCode, HiUsers, HiMenu, HiX, HiLogout, HiPlus, HiTrash, HiPencil, HiAcademicCap, HiMail } from 'react-icons/hi';
import { FaPaperPlane } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { courseAPI, problemAPI, subjectAPI, adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

// ============ ADMIN LAYOUT ============
export const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { path: '/admin', icon: <HiHome />, label: 'Dashboard', end: true },
    { path: '/admin/courses', icon: <HiBookOpen />, label: 'Courses' },
    { path: '/admin/subjects', icon: <HiAcademicCap />, label: 'Subjects' },
    { path: '/admin/problems', icon: <HiCode />, label: 'Problems' },
    { path: '/admin/users', icon: <HiUsers />, label: 'Users' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--gray-50)' }}>
      <div className="hidden lg:block w-64 fixed inset-y-0 left-0 z-30 bg-white" style={{ borderRight: '1px solid var(--gray-200)' }}>
        <div className="flex flex-col h-full">
          <div className="p-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
            <NavLink to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: 'var(--gradient-orange)' }}>V</div>
              <div><span className="font-bold" style={{ color: 'var(--blue-700)' }}>VES</span><span className="text-xs ml-1 font-medium" style={{ color: 'var(--orange-500)' }}>Admin</span></div>
            </NavLink>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {links.map(l => (
              <NavLink key={l.path} to={l.path} end={l.end} className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'shadow-sm' : 'hover:bg-gray-50'}`}
                style={({ isActive }) => ({ background: isActive ? 'var(--blue-50)' : 'transparent', color: isActive ? 'var(--blue-700)' : 'var(--gray-500)' })}>
                <span className="text-lg">{l.icon}</span>{l.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 px-4 py-2 w-full rounded-lg text-sm text-red-500 hover:bg-red-50 transition-all">
              <HiLogout /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile toggle */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden" style={{ borderRight: '1px solid var(--gray-200)' }}>
              <div className="flex flex-col h-full">
                <div className="p-5"><span className="font-bold" style={{ color: 'var(--blue-700)' }}>VES</span><span className="text-xs ml-1" style={{ color: 'var(--orange-500)' }}>Admin</span></div>
                <nav className="flex-1 p-4 space-y-1">
                  {links.map(l => <NavLink key={l.path} to={l.path} end={l.end} onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium" style={{ color: 'var(--gray-500)' }}><span className="text-lg">{l.icon}</span>{l.label}</NavLink>)}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 bg-white/90 backdrop-blur-xl" style={{ borderBottom: '1px solid var(--gray-200)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--gray-500)' }}><HiMenu size={24} /></button>
          <span className="font-bold" style={{ color: 'var(--blue-700)' }}>VES Admin</span>
        </div>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
};

// ============ NOTIFICATION MODAL ============
const NotificationModal = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    if (isOpen) {
      adminAPI.getUsers().then(({ data }) => { setUsers(data); setLoadingUsers(false); }).catch(() => setLoadingUsers(false));
    }
  }, [isOpen]);

  const toggleUser = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === users.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(users.map((u) => u._id)));
  };

  const handleSend = async () => {
    if (!subject.trim()) return toast.error('Please enter a subject');
    if (!content.trim()) return toast.error('Please enter content');
    if (selectedIds.size === 0) return toast.error('Please select at least one user');

    setLoading(true);
    try {
      const { data } = await adminAPI.sendNotification({
        subject,
        content,
        userIds: Array.from(selectedIds),
      });
      toast.success(data.message);
      setSubject(''); setContent(''); setSelectedIds(new Set());
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        style={{ border: '1px solid var(--gray-200)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--gray-200)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg fi-blue">
              <HiMail />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--gray-900)' }}>Send Notification</h2>
              <p className="text-xs" style={{ color: 'var(--gray-500)' }}>Send email to selected users</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--gray-400)' }}>
            <HiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
              className="input-light !text-sm" placeholder="e.g. New Course Available!" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={4}
              className="input-light !text-sm resize-y" placeholder="Write your notification message here..." />
          </div>

          {/* User Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold" style={{ color: 'var(--gray-700)' }}>
                Select Users <span className="font-normal" style={{ color: 'var(--gray-400)' }}>({selectedIds.size}/{users.length})</span>
              </label>
              <button onClick={toggleAll} className="text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                style={{ background: selectedIds.size === users.length ? 'var(--blue-100)' : 'var(--gray-100)', color: selectedIds.size === users.length ? 'var(--blue-700)' : 'var(--gray-500)' }}>
                {selectedIds.size === users.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--gray-200)', maxHeight: 240 }}>
              <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
                {loadingUsers ? (
                  <div className="p-4 text-center text-sm" style={{ color: 'var(--gray-400)' }}>Loading users...</div>
                ) : users.length === 0 ? (
                  <div className="p-4 text-center text-sm" style={{ color: 'var(--gray-400)' }}>No users found</div>
                ) : (
                  users.map((user) => (
                    <label key={user._id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50"
                      style={{ borderBottom: '1px solid var(--gray-100)' }}
                    >
                      <input type="checkbox" checked={selectedIds.has(user._id)} onChange={() => toggleUser(user._id)}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-600" />
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ background: user.role === 'admin' ? 'var(--gradient-orange)' : 'var(--gradient-blue)' }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--gray-800)' }}>{user.name}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--gray-400)' }}>{user.email}</div>
                      </div>
                      <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full" style={{
                        background: user.role === 'admin' ? 'var(--orange-100)' : 'var(--blue-100)',
                        color: user.role === 'admin' ? 'var(--orange-600)' : 'var(--blue-700)',
                      }}>{user.role}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6" style={{ borderTop: '1px solid var(--gray-200)' }}>
          <button onClick={onClose} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
          <button onClick={handleSend} disabled={loading} className="btn-primary !py-2.5 !px-6 !text-sm disabled:opacity-50">
            {loading ? 'Sending...' : <><FaPaperPlane /> Send Notification</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ============ ADMIN DASHBOARD ============
export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  useEffect(() => { adminAPI.getStats().then(({ data }) => setStats(data)).catch(() => {}); }, []);

  const cards = stats ? [
    { label: 'Users', value: stats.users, bg: 'var(--blue-100)', color: 'var(--blue-700)' },
    { label: 'Courses', value: stats.courses, bg: 'var(--orange-100)', color: 'var(--orange-600)' },
    { label: 'Problems', value: stats.problems, bg: '#dcfce7', color: '#16a34a' },
    { label: 'Submissions', value: stats.submissions, bg: '#f3e8ff', color: '#9333ea' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Admin Dashboard</h1>
        <button onClick={() => setShowNotification(true)} className="btn-primary !py-2.5 !px-5 !text-sm">
          <HiMail /> Send Notification
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}
            className="bg-white rounded-[16px] p-6 shadow-sm text-center" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-xl" style={{ background: c.bg, color: c.color }}>
              {i === 0 ? <HiUsers /> : i === 1 ? <HiBookOpen /> : i === 2 ? <HiCode /> : <HiAcademicCap />}
            </div>
            <div className="text-3xl font-bold" style={{ color: 'var(--gray-900)' }}>{c.value}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--gray-500)' }}>{c.label}</div>
          </motion.div>
        ))}
      </div>

      <NotificationModal isOpen={showNotification} onClose={() => setShowNotification(false)} />
    </div>
  );
};

// ============ GENERIC CRUD COMPONENT ============
const CrudPanel = ({ title, fetchFn, deleteFn, fields, createFn, updateFn }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});

  const load = () => { setLoading(true); fetchFn().then(({ data }) => { setItems(Array.isArray(data) ? data : data.problems || []); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const handleSave = async () => {
    try {
      if (editItem) { await updateFn(editItem._id, form); toast.success('Updated!'); }
      else { await createFn(form); toast.success('Created!'); }
      setShowForm(false); setEditItem(null); setForm({}); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try { await deleteFn(id); toast.success('Deleted!'); load(); } catch { toast.error('Delete failed'); }
  };

  const startEdit = (item) => { setEditItem(item); const f = {}; fields.forEach(fi => f[fi.key] = item[fi.key] || ''); setForm(f); setShowForm(true); };
  const startCreate = () => { setEditItem(null); const f = {}; fields.forEach(fi => f[fi.key] = fi.default || ''); setForm(f); setShowForm(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>{title}</h1>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5 !text-sm"><HiPlus /> Add New</button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <h2 className="font-bold mb-4" style={{ color: 'var(--gray-900)' }}>{editItem ? 'Edit' : 'Create'} {title.replace('Manage ', '')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {fields.map((f) => (
              <div key={f.key} className={f.fullWidth ? 'md:col-span-2' : ''}>
                <label className="block text-xs font-semibold mb-1.5 capitalize" style={{ color: 'var(--gray-700)' }}>{f.label || f.key}</label>
                {f.type === 'textarea' ? (
                  <textarea value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} rows={4} className="input-light !text-sm resize-y" />
                ) : f.type === 'select' ? (
                  <select value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-light !text-sm cursor-pointer">
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type={f.type || 'text'} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="input-light !text-sm" placeholder={f.placeholder} />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handleSave} className="btn-primary !py-2.5 !px-6 !text-sm">{editItem ? 'Update' : 'Create'}</button>
            <button onClick={() => { setShowForm(false); setEditItem(null); }} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
              {fields.filter(f => f.showInTable !== false).map(f => <th key={f.key} className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>{f.label || f.key}</th>)}
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                  {fields.filter(f => f.showInTable !== false).map(f => (
                    <td key={f.key} className="py-3 px-4 text-sm" style={{ color: 'var(--gray-700)' }}>
                      {String(item[f.key] || '').substring(0, 50)}{String(item[f.key] || '').length > 50 ? '...' : ''}
                    </td>
                  ))}
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(item)} className="p-2 rounded-lg hover:bg-blue-50 transition-colors" style={{ color: 'var(--blue-600)' }}><HiPencil /></button>
                    <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500"><HiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {items.length === 0 && <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No items yet.</div>}
      </div>
    </div>
  );
};

// ============ ADMIN COURSES (standalone file) ============
export { default as AdminCourses } from './AdminCourses';

// ============ ADMIN SUBJECTS ============
export const AdminSubjects = () => (
  <CrudPanel title="Manage Subjects" fetchFn={() => subjectAPI.getAll()} deleteFn={(id) => subjectAPI.delete(id)} createFn={(d) => subjectAPI.create(d)} updateFn={(id, d) => subjectAPI.update(id, d)}
    fields={[
      { key: 'name', label: 'Name' },
      { key: 'description', label: 'Description', type: 'textarea', fullWidth: true },
      { key: 'icon', label: 'Icon (emoji)', placeholder: '🧮' },
    ]}
  />
);

// ============ ADMIN PROBLEMS (standalone file) ============
export { default as AdminProblems } from './AdminProblems';

// ============ ADMIN USERS ============
export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { adminAPI.getUsers().then(({ data }) => { setUsers(data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const toggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try { await adminAPI.updateRole(userId, newRole); toast.success(`Role changed to ${newRole}`); load(); } catch { toast.error('Failed'); }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    try { await adminAPI.deleteUser(userId); toast.success('Deleted!'); load(); } catch { toast.error('Failed'); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Manage Users</h1>
      <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Name</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Email</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Role</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{u.name}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--gray-500)' }}>{u.email}</td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'badge-orange' : 'badge-blue'}`} style={{
                    background: u.role === 'admin' ? 'var(--orange-100)' : 'var(--blue-100)',
                    color: u.role === 'admin' ? 'var(--orange-600)' : 'var(--blue-700)',
                  }}>{u.role}</span></td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => toggleRole(u._id, u.role)} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors hover:bg-blue-50" style={{ color: 'var(--blue-600)' }}>Toggle Role</button>
                    <button onClick={() => deleteUser(u._id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-500"><HiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
