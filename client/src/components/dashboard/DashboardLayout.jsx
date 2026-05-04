import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { HiHome, HiBookOpen, HiCode, HiFolder, HiUser, HiMenu, HiX, HiLogout, HiChartBar, HiAcademicCap, HiChatAlt2, HiLightningBolt, HiDocumentText, HiBriefcase, HiClipboardList, HiCalendar } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import NotificationBell from '../common/NotificationBell';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { path: '/dashboard', icon: <HiHome />, label: 'Dashboard', end: true },
    { path: '/dashboard/learning', icon: <HiBookOpen />, label: 'Learning' },
    { path: '/dashboard/my-courses', icon: <HiAcademicCap />, label: 'My Courses' },
    { path: '/dashboard/practice', icon: <HiCode />, label: 'Practice' },
    { path: '/dashboard/community', icon: <HiChatAlt2 />, label: 'Community' },
    { path: '/dashboard/ai-assistant', icon: <HiLightningBolt />, label: 'AI Assistant' },
    { path: '/dashboard/certificates', icon: <HiDocumentText />, label: 'Certificates' },
    { path: '/dashboard/jobs', icon: <HiBriefcase />, label: 'Jobs' },
    { path: '/dashboard/resume-tools', icon: <HiDocumentText />, label: 'Resume Tools' },
    { path: '/dashboard/progress', icon: <HiChartBar />, label: 'Progress' },
    { path: '/dashboard/resources', icon: <HiFolder />, label: 'Resources' },
    { path: '/dashboard/ebooks', icon: <HiBookOpen />, label: 'E-Books' },
    { path: '/dashboard/leaderboard', icon: <HiChartBar />, label: 'Leaderboard' },
    { path: '/dashboard/quizzes', icon: <HiClipboardList />, label: 'Quizzes' },
    { path: '/dashboard/events', icon: <HiCalendar />, label: 'Events' },
    { path: '/dashboard/profile', icon: <HiUser />, label: 'Profile' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-5" style={{ borderBottom: '1px solid var(--gray-200)' }}>
        <NavLink to="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="VedhaEduSpark" className="w-9 h-9 rounded-lg object-contain" />
          <span className="font-bold" style={{ color: 'var(--blue-700)' }}>VES</span>
        </NavLink>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {links.map((link) => (
          <NavLink key={link.path} to={link.path} end={link.end} onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'shadow-sm'
                  : 'hover:bg-gray-50'
              }`
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--blue-50)' : 'transparent',
              color: isActive ? 'var(--blue-700)' : 'var(--gray-500)',
            })}
          >
            <span className="text-lg">{link.icon}</span>{link.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0"
            style={{ background: 'var(--gradient-blue)' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold truncate" style={{ color: 'var(--gray-900)' }}>{user?.name}</div>
            <div className="text-xs truncate" style={{ color: 'var(--gray-400)' }}>{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 w-full rounded-lg text-sm transition-all hover:bg-red-50"
          style={{ color: 'var(--gray-500)' }}>
          <HiLogout /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--gray-50)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 fixed inset-y-0 left-0 z-30 bg-white" style={{ borderRight: '1px solid var(--gray-200)' }}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/30 z-40 lg:hidden" />
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden" style={{ borderRight: '1px solid var(--gray-200)' }}>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64">
        <div className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 h-14 bg-white/90 backdrop-blur-xl"
          style={{ borderBottom: '1px solid var(--gray-200)' }}>
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--gray-500)' }}><HiMenu size={24} /></button>
          <img src="/logo.png" alt="VES" className="w-7 h-7 rounded-lg object-contain" />
          <span className="font-bold flex-1" style={{ color: 'var(--blue-700)' }}>VES</span>
          <NotificationBell />
        </div>
        {/* Desktop top bar */}
        <div className="hidden lg:flex sticky top-0 z-20 items-center justify-end px-8 h-14 bg-white/90 backdrop-blur-xl"
          style={{ borderBottom: '1px solid var(--gray-200)' }}>
          <NotificationBell />
        </div>
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
