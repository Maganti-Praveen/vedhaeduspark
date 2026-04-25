import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube, FaXTwitter } from 'react-icons/fa6';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/courses' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const courseLinks = [
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Operating Systems',
    'Computer Networks',
    'Web Development',
  ];

  const socials = [
    { icon: <FaFacebookF />, href: '#' },
    { icon: <FaInstagram />, href: '#' },
    { icon: <FaLinkedinIn />, href: '#' },
    { icon: <FaYoutube />, href: '#' },
    { icon: <FaXTwitter />, href: '#' },
  ];

  return (
    <footer style={{ background: 'var(--gray-900)', color: 'rgba(255,255,255,0.7)', padding: '60px 0 0' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <div
          className="grid gap-10 pb-10"
          style={{
            gridTemplateColumns: '2fr 1fr 1fr 1.2fr',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-lg"
                style={{ background: 'var(--gradient-orange)' }}
              >
                V
              </div>
              <span className="text-xl font-bold text-white">Vedha EduSpark</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Empowering students with in-demand tech skills through hands-on training,
              expert mentorship, and career-focused education.
            </p>
            <div className="flex gap-3">
              {socials.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center text-base transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--blue-600)';
                    e.currentTarget.style.color = 'var(--white)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                  }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-bold text-white mb-5">Quick Links</h4>
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block text-sm mb-3 transition-all duration-300 hover:pl-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange-400)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Courses */}
          <div>
            <h4 className="text-base font-bold text-white mb-5">Our Courses</h4>
            {courseLinks.map((course, i) => (
              <Link
                key={i}
                to="/courses"
                className="block text-sm mb-3 transition-all duration-300 hover:pl-1"
                style={{ color: 'rgba(255,255,255,0.6)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--orange-400)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
              >
                {course}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-base font-bold text-white mb-5">Stay Updated</h4>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Subscribe to get notified about new courses and offers.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email"
                className="input-dark flex-1 !py-3 !px-4 !text-sm"
              />
              <button
                type="submit"
                className="px-5 py-3 rounded-lg font-semibold text-white text-sm border-none cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                style={{ background: 'var(--gradient-orange)' }}
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="text-center py-6 text-sm">
          © 2026 <span style={{ color: 'var(--orange-400)', fontWeight: 600 }}>Vedha EduSpark Centre</span>. All rights reserved.
        </div>
      </div>

      {/* Responsive footer for mobile */}
      <style>{`
        @media (max-width: 1024px) {
          footer .grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 768px) {
          footer .grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
