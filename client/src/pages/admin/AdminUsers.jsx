import { useState, useEffect } from 'react';
import { HiTrash } from 'react-icons/hi';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); adminAPI.getUsers().then(({ data }) => { setUsers(data); setLoading(false); }).catch(() => setLoading(false)); };
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
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                    <td className="py-3 px-4"><div className="h-4 w-32 rounded-md animate-pulse" style={{ background: 'var(--gray-100)' }} /></td>
                    <td className="py-3 px-4"><div className="h-4 w-40 rounded-md animate-pulse" style={{ background: 'var(--gray-100)' }} /></td>
                    <td className="py-3 px-4"><div className="h-5 w-14 rounded-full animate-pulse" style={{ background: 'var(--gray-100)' }} /></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 rounded-md animate-pulse" style={{ background: 'var(--gray-100)' }} /></td>
                  </tr>
                ))
              ) : users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{u.name}</td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--gray-500)' }}>{u.email}</td>
                  <td className="py-3 px-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{
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
        {!loading && users.length === 0 && <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No users found.</div>}
      </div>
    </div>
  );
};

export default AdminUsers;
