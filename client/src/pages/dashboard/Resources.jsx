import { motion } from 'framer-motion';
import { FaBook, FaYoutube, FaGithub, FaCode, FaExternalLinkAlt } from 'react-icons/fa';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }) };

const Resources = () => {
  const categories = [
    { title: 'DSA Resources', icon: '🧮', links: [
      { label: 'GeeksforGeeks - DSA Tutorial', url: 'https://www.geeksforgeeks.org/data-structures/', icon: <FaExternalLinkAlt /> },
      { label: 'LeetCode Problems', url: 'https://leetcode.com/problemset/', icon: <FaCode /> },
      { label: 'Striver SDE Sheet', url: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', icon: <FaBook /> },
    ]},
    { title: 'DBMS Resources', icon: '🗄️', links: [
      { label: 'DBMS Complete Notes - GFG', url: 'https://www.geeksforgeeks.org/dbms/', icon: <FaBook /> },
      { label: 'SQL Practice - W3Schools', url: 'https://www.w3schools.com/sql/', icon: <FaCode /> },
    ]},
    { title: 'OS Resources', icon: '⚙️', links: [
      { label: 'Operating Systems - GFG', url: 'https://www.geeksforgeeks.org/operating-systems/', icon: <FaBook /> },
      { label: 'OS YouTube Playlist', url: 'https://youtube.com', icon: <FaYoutube /> },
    ]},
    { title: 'Development', icon: '💻', links: [
      { label: 'FreeCodeCamp', url: 'https://www.freecodecamp.org/', icon: <FaCode /> },
      { label: 'MDN Web Docs', url: 'https://developer.mozilla.org/', icon: <FaBook /> },
      { label: 'GitHub Student Pack', url: 'https://education.github.com/pack', icon: <FaGithub /> },
    ]},
  ];

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>Resources</h1>
        <p style={{ color: 'var(--gray-500)' }}>Curated learning resources for CSE students</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((cat, i) => (
          <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
            className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
              <span>{cat.icon}</span> {cat.title}
            </h2>
            <div className="space-y-2">
              {cat.links.map((link, j) => (
                <a key={j} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all group hover:-translate-y-0.5"
                  style={{ background: 'var(--gray-50)', color: 'var(--gray-700)' }}>
                  <span style={{ color: 'var(--gray-400)' }}>{link.icon}</span>
                  <span className="flex-1 group-hover:text-blue-600 transition-colors">{link.label}</span>
                  <FaExternalLinkAlt className="text-xs" style={{ color: 'var(--gray-300)' }} />
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Resources;
