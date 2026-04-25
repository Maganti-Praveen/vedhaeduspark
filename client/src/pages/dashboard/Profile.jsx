import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaShieldAlt, FaCalendar, FaPen, FaSave, FaTimes, FaUniversity, FaCode, FaGraduationCap, FaFire, FaTrophy, FaMedal } from 'react-icons/fa';
import { HiCheckCircle, HiCode, HiAcademicCap, HiTrendingUp } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, submissionAPI, enrollmentAPI } from '../../services/api';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const DUMMY_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zen',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sky',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Nova',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Kai',
];

const SKILL_OPTIONS = ['DSA', 'Web Dev', 'DBMS', 'OS', 'CN', 'Python', 'Java', 'C++', 'React', 'Node.js', 'MongoDB', 'SQL', 'Machine Learning', 'Cloud Computing'];

const Profile = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      authAPI.getMe().catch(() => ({ data: null })),
      submissionAPI.getStats().catch(() => ({ data: { totalSubmissions: 0, accepted: 0, successRate: 0, uniqueSolved: 0 } })),
      enrollmentAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([profileRes, statsRes, enrollRes]) => {
      setProfile(profileRes.data);
      setStats(statsRes.data);
      setEnrollments(enrollRes.data);
      setLoading(false);
    });
  }, []);

  const startEdit = () => {
    setForm({
      name: profile?.name || '',
      bio: profile?.bio || '',
      college: profile?.college || '',
      branch: profile?.branch || '',
      year: profile?.year || '',
      skills: profile?.skills || [],
      avatar: profile?.avatar || '',
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      setProfile(data);
      // Update local storage
      const stored = JSON.parse(localStorage.getItem('ves_user') || '{}');
      stored.name = data.name;
      localStorage.setItem('ves_user', JSON.stringify(stored));
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
    setSaving(false);
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="skeleton h-10 w-48"></div>
        <div className="skeleton h-64 rounded-[20px]"></div>
        <div className="skeleton h-40 rounded-[20px]"></div>
      </div>
    );
  }

  const displayUser = profile || user;
  const memberSince = displayUser?.createdAt ? new Date(displayUser.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>My Profile</h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Manage your account and view your progress</p>
        </div>
        {!editing && (
          <button onClick={startEdit} className="btn-outline !py-2.5 !px-5 !text-sm">
            <FaPen className="text-xs" /> Edit Profile
          </button>
        )}
      </motion.div>

      {/* ============ PROFILE CARD ============ */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
        className="bg-white rounded-[20px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        {/* Cover gradient */}
        <div className="h-28 sm:h-36" style={{ background: 'var(--gradient-hero)' }} />

        <div className="px-6 sm:px-8 pb-8 -mt-14 sm:-mt-16">
          {/* Avatar + Name */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
            <div className="relative">
              {displayUser?.avatar ? (
                <img src={displayUser.avatar} alt="Avatar" className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg object-cover" style={{ background: 'var(--gray-100)' }} />
              ) : (
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-white text-4xl font-bold"
                  style={{ background: 'var(--gradient-blue)' }}>
                  {displayUser?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {displayUser?.streak > 0 && (
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md"
                  style={{ background: 'var(--gradient-orange)' }}>
                  <FaFire /> {displayUser.streak}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>{displayUser?.name}</h2>
              <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{displayUser?.email}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{
                  background: displayUser?.role === 'admin' ? 'var(--orange-100)' : 'var(--blue-100)',
                  color: displayUser?.role === 'admin' ? 'var(--orange-600)' : 'var(--blue-700)',
                }}>{displayUser?.role?.toUpperCase()}</span>
                {displayUser?.year && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                    {displayUser.year}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <FaCalendar className="inline text-[0.6rem] mr-1" /> Joined {memberSince}
                </span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {displayUser?.bio && (
            <p className="text-sm leading-relaxed mb-4 px-1" style={{ color: 'var(--gray-600)' }}>"{displayUser.bio}"</p>
          )}

          {/* Info Grid */}
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: <FaUniversity />, label: 'College', value: displayUser?.college || '—' },
              { icon: <FaCode />, label: 'Branch', value: displayUser?.branch || '—' },
              { icon: <FaGraduationCap />, label: 'Year', value: displayUser?.year || '—' },
              { icon: <FaCalendar />, label: 'Last Active', value: displayUser?.lastActive ? new Date(displayUser.lastActive).toLocaleDateString('en-IN') : 'Today' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: 'var(--gray-50)' }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 fi-blue text-sm">{item.icon}</div>
                <div>
                  <div className="text-[0.7rem] uppercase font-semibold tracking-wider" style={{ color: 'var(--gray-400)' }}>{item.label}</div>
                  <div className="text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          {displayUser?.skills?.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gray-400)' }}>Skills</div>
              <div className="flex flex-wrap gap-2">
                {displayUser.skills.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-100)' }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Badges */}
          {displayUser?.badges?.length > 0 && (
            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--gray-400)' }}>Badges</div>
              <div className="flex flex-wrap gap-2">
                {displayUser.badges.map((badge, i) => (
                  <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'var(--orange-50)', color: 'var(--orange-600)', border: '1px solid var(--orange-100)' }}>
                    <FaMedal className="text-[0.65rem]" /> {badge}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ============ STATS CARDS ============ */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2}>
        <h2 className="font-bold text-lg mb-4" style={{ color: 'var(--gray-900)' }}>Progress Overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <HiCode className="text-xl" />, value: stats?.uniqueSolved || 0, label: 'Problems Solved', bg: 'var(--blue-100)', color: 'var(--blue-700)' },
            { icon: <HiCheckCircle className="text-xl" />, value: `${stats?.successRate || 0}%`, label: 'Success Rate', bg: '#dcfce7', color: '#16a34a' },
            { icon: <HiTrendingUp className="text-xl" />, value: stats?.totalSubmissions || 0, label: 'Submissions', bg: '#f3e8ff', color: '#9333ea' },
            { icon: <HiAcademicCap className="text-xl" />, value: enrollments.length, label: 'Courses', bg: 'var(--orange-100)', color: 'var(--orange-600)' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-[16px] p-5 shadow-sm text-center" style={{ border: '1px solid var(--gray-200)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--gray-500)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ============ DIFFICULTY BREAKDOWN ============ */}
      <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
        className="bg-white rounded-[20px] p-6 sm:p-8 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <h2 className="font-bold text-lg mb-5" style={{ color: 'var(--gray-900)' }}>Difficulty Breakdown</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Easy', value: displayUser?.progressStats?.easy || 0, barColor: '#22c55e', bgColor: '#dcfce7' },
            { label: 'Medium', value: displayUser?.progressStats?.medium || 0, barColor: '#f59e0b', bgColor: '#fef3c7' },
            { label: 'Hard', value: displayUser?.progressStats?.hard || 0, barColor: '#ef4444', bgColor: '#fee2e2' },
          ].map((d, i) => {
            const total = (displayUser?.progressStats?.easy || 0) + (displayUser?.progressStats?.medium || 0) + (displayUser?.progressStats?.hard || 0);
            const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
            return (
              <div key={i} className="text-center p-4 rounded-xl" style={{ background: d.bgColor }}>
                <div className="text-3xl font-bold mb-1" style={{ color: d.barColor }}>{d.value}</div>
                <div className="text-xs font-semibold mb-2" style={{ color: d.barColor }}>{d.label}</div>
                <div className="w-full h-1.5 rounded-full bg-white/70">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: d.barColor }} />
                </div>
                <div className="text-[0.65rem] mt-1 font-medium" style={{ color: d.barColor }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* ============ EDIT MODAL ============ */}
      {editing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEditing(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            style={{ border: '1px solid var(--gray-200)' }}
          >
            <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <h2 className="text-lg font-bold" style={{ color: 'var(--gray-900)' }}>Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="p-2 rounded-lg hover:bg-gray-100" style={{ color: 'var(--gray-400)' }}>
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Avatar Picker */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Choose Avatar</label>
                <div className="flex flex-wrap gap-3">
                  {DUMMY_AVATARS.map((url, i) => (
                    <button key={i} onClick={() => setForm({ ...form, avatar: url })}
                      className="w-14 h-14 rounded-xl overflow-hidden transition-all border-2"
                      style={{
                        borderColor: form.avatar === url ? 'var(--blue-600)' : 'var(--gray-200)',
                        boxShadow: form.avatar === url ? 'var(--shadow-blue)' : 'none',
                      }}>
                      <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full" />
                    </button>
                  ))}
                  <button onClick={() => setForm({ ...form, avatar: '' })}
                    className="w-14 h-14 rounded-xl border-2 flex items-center justify-center text-xs font-semibold transition-all"
                    style={{
                      borderColor: !form.avatar ? 'var(--blue-600)' : 'var(--gray-200)',
                      color: !form.avatar ? 'var(--blue-600)' : 'var(--gray-400)',
                      background: !form.avatar ? 'var(--blue-50)' : 'var(--gray-50)',
                    }}>
                    Initial
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Full Name *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-light !text-sm" placeholder="Your full name" />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Bio</label>
                <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2}
                  className="input-light !text-sm resize-y" placeholder="A short bio about yourself..." maxLength={300} />
                <div className="text-right text-xs mt-1" style={{ color: 'var(--gray-400)' }}>{form.bio?.length || 0}/300</div>
              </div>

              {/* College & Branch */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>College</label>
                  <input type="text" value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })}
                    className="input-light !text-sm" placeholder="e.g. IIT Hyderabad" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Branch</label>
                  <input type="text" value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="input-light !text-sm" placeholder="e.g. CSE" />
                </div>
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Year</label>
                <select value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="input-light !text-sm cursor-pointer">
                  <option value="">Select Year</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                </select>
              </div>

              {/* Skills */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>
                  Skills <span className="font-normal" style={{ color: 'var(--gray-400)' }}>({form.skills?.length || 0} selected)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => {
                    const selected = form.skills?.includes(skill);
                    return (
                      <button key={skill} onClick={() => toggleSkill(skill)}
                        className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={{
                          background: selected ? 'var(--blue-600)' : 'var(--gray-100)',
                          color: selected ? '#fff' : 'var(--gray-500)',
                          boxShadow: selected ? 'var(--shadow-blue)' : 'none',
                        }}>
                        {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6" style={{ borderTop: '1px solid var(--gray-200)' }}>
              <button onClick={() => setEditing(false)} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary !py-2.5 !px-6 !text-sm disabled:opacity-50">
                {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
