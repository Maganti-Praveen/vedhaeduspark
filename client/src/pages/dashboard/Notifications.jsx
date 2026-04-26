import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiBell, HiTrash, HiCheck } from 'react-icons/hi';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const typeEmoji = { welcome: '🎉', achievement: '✅', course: '🎓', admin: '📢', discussion: '💬' };
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.3 } }) };

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    notificationAPI.getAll().then(({ data }) => { setNotifications(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All marked as read');
  };

  const handleClick = async (n) => {
    if (!n.isRead) {
      await notificationAPI.markRead(n._id);
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
    }
    if (n.link) navigate(n.link);
  };

  const handleDelete = async (id) => {
    await notificationAPI.delete(id);
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>🔔 Notifications</h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>
            <HiCheck /> Mark All Read
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-[14px]" />)}</div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <HiBell className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <motion.div key={n._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
              className="flex items-center gap-3 bg-white rounded-[14px] p-4 shadow-sm transition-all hover:shadow-md cursor-pointer"
              style={{ border: '1px solid var(--gray-200)', background: n.isRead ? '#fff' : 'var(--blue-50)' }}
              onClick={() => handleClick(n)}>
              <div className="text-xl flex-shrink-0">{typeEmoji[n.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold truncate" style={{ color: 'var(--gray-800)' }}>{n.title}</span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--blue-600)' }} />}
                </div>
                <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--gray-500)' }}>{n.message}</p>
                <span className="text-[0.6rem]" style={{ color: 'var(--gray-400)' }}>{new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id); }}
                className="p-2 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0" style={{ color: 'var(--gray-400)' }}>
                <HiTrash />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
