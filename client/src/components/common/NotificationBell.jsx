import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiBell } from 'react-icons/hi';
import { notificationAPI } from '../../services/api';

const typeEmoji = { welcome: '🎉', achievement: '✅', course: '🎓', admin: '📢', discussion: '💬' };
const typeColor = { welcome: '#8b5cf6', achievement: '#16a34a', course: '#2563eb', admin: '#f59e0b', discussion: '#06b6d4' };

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();

  const fetch = async () => {
    try {
      const [{ data: list }, { data: { count } }] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getUnreadCount(),
      ]);
      setNotifications(list);
      setUnread(count);
    } catch { }
  };

  useEffect(() => { fetch(); const t = setInterval(fetch, 30000); return () => clearInterval(t); }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n) => {
    if (!n.isRead) {
      await notificationAPI.markRead(n._id);
      setUnread(u => Math.max(0, u - 1));
      setNotifications(prev => prev.map(x => x._id === n._id ? { ...x, isRead: true } : x));
    }
    if (n.link) { navigate(n.link); setOpen(false); }
  };

  const markAllRead = async () => {
    await notificationAPI.markAllRead();
    setUnread(0);
    setNotifications(prev => prev.map(x => ({ ...x, isRead: true })));
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date)) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" style={{ color: 'var(--gray-500)' }}>
        <HiBell size={22} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center rounded-full text-[0.6rem] font-bold text-white animate-pulse"
            style={{ background: '#ef4444' }}>{unread > 9 ? '9+' : unread}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-[16px] shadow-xl z-50 overflow-hidden"
          style={{ border: '1px solid var(--gray-200)', maxHeight: 420 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--gray-100)' }}>
            <h3 className="font-bold text-sm" style={{ color: 'var(--gray-900)' }}>Notifications</h3>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold" style={{ color: 'var(--blue-600)' }}>Mark all read</button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
            {notifications.length === 0 ? (
              <div className="text-center py-10">
                <HiBell className="text-3xl mx-auto mb-2" style={{ color: 'var(--gray-300)' }} />
                <p className="text-sm" style={{ color: 'var(--gray-400)' }}>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 15).map(n => (
                <button key={n._id} onClick={() => handleClick(n)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                  style={{ background: n.isRead ? 'transparent' : 'var(--blue-50)', borderBottom: '1px solid var(--gray-50)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm mt-0.5"
                    style={{ background: `${typeColor[n.type]}15`, color: typeColor[n.type] }}>
                    {typeEmoji[n.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate" style={{ color: 'var(--gray-800)' }}>{n.title}</span>
                      {!n.isRead && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--blue-600)' }} />}
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'var(--gray-500)' }}>{n.message}</p>
                    <span className="text-[0.6rem]" style={{ color: 'var(--gray-400)' }}>{timeAgo(n.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <button onClick={() => { navigate('/dashboard/notifications'); setOpen(false); }}
              className="w-full py-2.5 text-xs font-semibold text-center transition-colors hover:bg-gray-50"
              style={{ color: 'var(--blue-600)', borderTop: '1px solid var(--gray-100)' }}>
              View All Notifications
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
