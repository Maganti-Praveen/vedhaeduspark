import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const megaItems = [
  { label: '< C', emoji: '' },
  { label: 'C++', emoji: '' },
  { label: 'Java', emoji: '' },
  { label: 'Python', emoji: '' },
  { label: 'DSA', emoji: '' },
  { label: 'DBMS', emoji: '' },
  { label: 'SQL', emoji: '' },
  { label: 'HTML', emoji: '' },
  { label: 'CSS', emoji: '' },
  { label: 'JavaScript', emoji: '' },
  { label: 'React', emoji: '' },
  { label: 'Node.js', emoji: '' },
  { label: 'Express.js', emoji: '' },
  { label: 'MongoDB', emoji: '' },
  { label: 'Firebase', emoji: '' },
  { label: 'Operating System', emoji: '' },
  { label: 'Computer Network', emoji: '' },
  { label: 'Artificial Intelligence', emoji: '' },
  { label: 'E-Books', emoji: '📚', special: true },
  { label: 'Courses', emoji: '🎓', special: true },
  { label: 'Resume Tools', emoji: '📄', special: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isPublic = ['/', '/courses', '/about', '/contact'].includes(location.pathname);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [location]);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/courses', label: 'Courses' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  // On homepage, navbar starts transparent over hero; on other pages, starts solid
  const isTransparent = isHome && !scrolled;

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] transition-all duration-300"
        style={{
          padding: scrolled ? '10px 0' : '16px 0',
          background: isTransparent ? 'transparent' : 'rgba(255,255,255,0.95)',
          backdropFilter: !isTransparent ? 'blur(20px)' : 'none',
          boxShadow: !isTransparent ? 'var(--shadow-sm)' : 'none',
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="VedhaEduSpark" className="h-10 w-10 rounded-xl object-contain" />
            <span
              className="text-xl font-bold transition-colors duration-300"
              style={{ color: isTransparent ? 'var(--white)' : 'var(--blue-700)' }}
            >
              Vedha EduSpark
            </span>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden lg:flex items-center gap-9">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="text-[0.95rem] font-medium relative py-1 transition-colors duration-300"
                  style={{
                    color: location.pathname === link.path
                      ? (isTransparent ? 'var(--white)' : 'var(--blue-700)')
                      : (isTransparent ? 'rgba(255,255,255,0.85)' : 'var(--gray-700)'),
                  }}
                >
                  {link.label}
                  <span
                    className="absolute bottom-[-2px] left-0 h-[2px] rounded-full transition-all duration-300"
                    style={{
                      width: location.pathname === link.path ? '100%' : '0',
                      background: 'var(--orange-500)',
                    }}
                  />
                </Link>
              </li>
            ))}

            {/* Auth Links */}
            {user ? (
              <li>
                <Link
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="px-6 py-2.5 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:-translate-y-0.5"
                  style={{ background: 'var(--gradient-orange)', boxShadow: 'var(--shadow-orange)' }}
                >
                  Dashboard
                </Link>
              </li>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="text-[0.95rem] font-medium transition-colors duration-300"
                    style={{ color: isTransparent ? 'rgba(255,255,255,0.85)' : 'var(--gray-700)' }}
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="px-6 py-2.5 rounded-full font-semibold text-white text-sm transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: 'var(--gradient-orange)', boxShadow: 'var(--shadow-orange)' }}
                  >
                    Enroll Now
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* Hamburger */}
          <button
            className="lg:hidden flex flex-col gap-[5px] cursor-pointer z-[1001]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span
              className="w-7 h-[3px] rounded-sm transition-all duration-300"
              style={{
                background: isTransparent ? 'var(--white)' : 'var(--blue-700)',
                transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="w-7 h-[3px] rounded-sm transition-all duration-300"
              style={{
                background: isTransparent ? 'var(--white)' : 'var(--blue-700)',
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="w-7 h-[3px] rounded-sm transition-all duration-300"
              style={{
                background: isTransparent ? 'var(--white)' : 'var(--blue-700)',
                transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
              }}
            />
          </button>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileOpen && (
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25 }}
                className="fixed top-0 right-0 w-[280px] h-screen bg-white shadow-2xl z-[999] flex flex-col justify-center items-center gap-6 lg:hidden"
              >
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="text-lg font-medium transition-colors"
                    style={{
                      color: location.pathname === link.path ? 'var(--blue-700)' : 'var(--gray-700)',
                    }}
                  >
                    {link.label}
                  </Link>
                ))}
                {user ? (
                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    className="btn-primary !py-3 !px-8"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="text-lg font-medium" style={{ color: 'var(--gray-700)' }}>Login</Link>
                    <Link to="/register" className="btn-primary !py-3 !px-8">Enroll Now</Link>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* ══════ MEGA MENU BAR ══════ */}
      {isPublic && (
        <div
          className="fixed left-0 right-0 z-[999] transition-all duration-300"
          style={{
            top: scrolled ? '56px' : '72px',
            background: 'linear-gradient(90deg, #1e2a4a 0%, #2d1b69 40%, #4a1942 100%)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
          }}
        >
          <div
            className="max-w-[1400px] mx-auto overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <div className="flex items-center min-w-max px-4">
              {megaItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.special ? (item.label === 'Courses' ? '/courses' : item.label === 'Resume Tools' ? '/dashboard/resume-tools' : '/dashboard/ebooks') : `/courses`}
                  className="mega-item group relative flex items-center gap-1.5 px-3.5 py-2.5 text-[0.78rem] font-medium whitespace-nowrap transition-all duration-200"
                  style={{
                    color: item.special ? '#fbbf24' : 'rgba(255,255,255,0.85)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = item.special ? '#fbbf24' : 'rgba(255,255,255,0.85)';
                  }}
                >
                  {item.emoji && <span className="text-xs">{item.emoji}</span>}
                  {item.label}
                  {/* Underline hover effect */}
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 group-hover:w-3/4 transition-all duration-300 rounded-full"
                    style={{ background: item.special ? '#fbbf24' : '#f97316' }}
                  />
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

