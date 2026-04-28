import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaShieldAlt, FaCalendar, FaPen, FaSave, FaTimes, FaUniversity, FaCode, FaGraduationCap, FaFire, FaTrophy, FaMedal, FaCamera, FaUpload } from 'react-icons/fa';
import { HiCheckCircle, HiCode, HiAcademicCap, HiTrendingUp } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI, submissionAPI, enrollmentAPI, uploadAPI } from '../../services/api';
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
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

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

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Only images allowed');
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');
    setUploading(true);
    try {
      const { data } = await uploadAPI.avatar(file);
      setForm({ ...form, avatar: data.url });
      toast.success('Photo uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 400, height: 400 } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch { toast.error('Camera access denied'); setShowCamera(false); }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'profile-photo.jpg', { type: 'image/jpeg' });
        closeCamera();
        await handleAvatarUpload(file);
      }
    }, 'image/jpeg', 0.85);
  };

  const closeCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setShowCamera(false);
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

        <div className="px-6 sm:px-8 pb-8">
          {/* Avatar — overlaps cover */}
          <div className="relative -mt-14 sm:-mt-16 mb-4 w-fit">
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

          {/* Name + Email + Badges — fully below cover */}
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>{displayUser?.name}</h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--gray-500)' }}>{displayUser?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
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
          ].map((d, i) => (
            <div key={i} className="text-center p-4 rounded-xl" style={{ background: d.bgColor }}>
              <div className="text-3xl font-bold" style={{ color: d.barColor }}>{d.value}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: d.barColor }}>{d.label}</div>
            </div>
          ))}
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
              {/* Profile Photo Upload */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Profile Photo</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0" style={{ background: 'var(--gray-100)' }}>
                    {form.avatar ? (
                      <img src={form.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-white" style={{ background: 'var(--gradient-blue)' }}>
                        {form.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button onClick={() => fileRef.current?.click()} disabled={uploading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>
                        <FaUpload /> Upload Photo
                      </button>
                      <button onClick={openCamera} disabled={uploading}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        style={{ background: '#dcfce7', color: '#16a34a' }}>
                        <FaCamera /> Take Photo
                      </button>
                    </div>
                    <span className="text-[0.65rem]" style={{ color: 'var(--gray-400)' }}>JPG, PNG • Max 5MB</span>
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => handleAvatarUpload(e.target.files[0])} />
                </div>
              </div>

              {/* Avatar Picker */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Or Choose Avatar</label>
                <div className="flex flex-wrap gap-3">
                  {DUMMY_AVATARS.map((url, i) => (
                    <button key={i} onClick={() => setForm({ ...form, avatar: url })}
                      className="w-12 h-12 rounded-xl overflow-hidden transition-all border-2"
                      style={{
                        borderColor: form.avatar === url ? 'var(--blue-600)' : 'var(--gray-200)',
                        boxShadow: form.avatar === url ? 'var(--shadow-blue)' : 'none',
                      }}>
                      <img src={url} alt={`Avatar ${i + 1}`} className="w-full h-full" />
                    </button>
                  ))}
                  <button onClick={() => setForm({ ...form, avatar: '' })}
                    className="w-12 h-12 rounded-xl border-2 flex items-center justify-center text-[0.6rem] font-semibold transition-all"
                    style={{
                      borderColor: !form.avatar ? 'var(--blue-600)' : 'var(--gray-200)',
                      color: !form.avatar ? 'var(--blue-600)' : 'var(--gray-400)',
                      background: !form.avatar ? 'var(--blue-50)' : 'var(--gray-50)',
                    }}>
                    None
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

      {/* ============ CAMERA MODAL ============ */}
      {showCamera && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold" style={{ color: 'var(--gray-900)' }}>📸 Take Photo</h3>
              <button onClick={closeCamera} className="p-2 rounded-lg hover:bg-gray-100"><FaTimes style={{ color: 'var(--gray-400)' }} /></button>
            </div>
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-xl mb-4 bg-black" style={{ maxHeight: 300 }} />
            <canvas ref={canvasRef} className="hidden" />
            <button onClick={capturePhoto} className="btn-primary w-full"><FaCamera /> Capture</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
