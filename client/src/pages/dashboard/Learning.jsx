import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiX } from 'react-icons/hi';
import { FaClock, FaArrowRight } from 'react-icons/fa';
import { subjectAPI, courseAPI, enrollmentAPI } from '../../services/api';
import { SkeletonCard } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.4 } }),
};

const Learning = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('courses'); // 'courses' | 'subjects'
  // Paid course popup
  const [enrollPopup, setEnrollPopup] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    Promise.all([
      subjectAPI.getAll().catch(() => ({ data: [] })),
      courseAPI.getAll().catch(() => ({ data: [] })),
      enrollmentAPI.getAll().catch(() => ({ data: [] })),
    ]).then(([subRes, courseRes, enrollRes]) => {
      setSubjects(subRes.data);
      setCourses(courseRes.data);
      setEnrolledIds(enrollRes.data.map(e => e.courseId?._id || e.courseId));
      setLoading(false);
    });
  }, []);

  const handleEnroll = (course) => {
    if (course.isFree !== false || !course.price) {
      enrollDirect(course._id);
    } else {
      setEnrollPopup(course);
      setCouponCode('');
    }
  };

  const enrollDirect = async (courseId) => {
    try {
      await enrollmentAPI.enroll(courseId);
      toast.success('Enrolled! 🎉');
      setEnrolledIds(prev => [...prev, courseId]);
    } catch (err) { toast.error(err.response?.data?.message || 'Enrollment failed'); }
  };

  const handleCouponEnroll = async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code');
    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(enrollPopup._id, couponCode.trim());
      toast.success('Enrolled! 🎉');
      setEnrolledIds(prev => [...prev, enrollPopup._id]);
      setEnrollPopup(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); }
    setEnrolling(false);
  };

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-48"></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  // Subject detail view
  if (selectedSubject) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => setSelectedSubject(null)} className="px-3 py-2 rounded-lg transition-colors hover:bg-gray-100" style={{ color: 'var(--gray-500)' }}>← Back</button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--gray-900)' }}>
              <span>{selectedSubject.icon}</span>{selectedSubject.name}
            </h1>
            <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{selectedSubject.description}</p>
          </div>
        </div>

        <div className="flex gap-2" style={{ borderBottom: '1px solid var(--gray-200)' }}>
          {['notes', 'videos', 'roadmap'].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className="px-5 py-2.5 rounded-t-lg text-sm font-medium capitalize transition-all"
              style={{
                color: activeTab === t ? 'var(--blue-700)' : 'var(--gray-500)',
                background: activeTab === t ? 'var(--blue-50)' : 'transparent',
                borderBottom: activeTab === t ? '2px solid var(--blue-600)' : '2px solid transparent',
              }}>{t}</button>
          ))}
        </div>

        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {selectedSubject.notes?.length > 0 ? selectedSubject.notes.map((note, i) => (
                <div key={i} className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--blue-700)' }}>{note.title}</h3>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed" style={{ color: 'var(--gray-700)' }}>
                    {note.content}
                  </div>
                </div>
              )) : <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No notes available yet.</div>}
            </div>
          )}
          {activeTab === 'videos' && (
            <div className="grid md:grid-cols-2 gap-4">
              {selectedSubject.videos?.length > 0 ? selectedSubject.videos.map((video, i) => (
                <div key={i} className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                  <div className="aspect-video">
                    <iframe src={video.youtubeUrl} title={video.title} className="w-full h-full" allowFullScreen />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--gray-800)' }}>{video.title}</h3>
                  </div>
                </div>
              )) : <div className="col-span-2 text-center py-12" style={{ color: 'var(--gray-400)' }}>No videos available yet.</div>}
            </div>
          )}
          {activeTab === 'roadmap' && (
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5" style={{ background: 'var(--gray-200)' }} />
              <div className="space-y-6">
                {selectedSubject.roadmap?.length > 0 ? selectedSubject.roadmap.map((step, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} initial="hidden" animate="visible" className="relative pl-14">
                    <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs z-10 ${
                      step.completed ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-400'
                    }`}>{step.completed ? '✓' : step.step}</div>
                    <div className="bg-white rounded-[16px] p-5 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                      <h3 className="font-bold mb-1" style={{ color: 'var(--gray-900)' }}>{step.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{step.description}</p>
                    </div>
                  </motion.div>
                )) : <div className="text-center py-12 pl-14" style={{ color: 'var(--gray-400)' }}>Roadmap coming soon.</div>}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>Learning Hub</h1>
        <p style={{ color: 'var(--gray-500)' }}>Explore courses and subjects to start learning</p>
      </motion.div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <button onClick={() => setTab('courses')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: tab === 'courses' ? 'var(--blue-600)' : 'var(--gray-100)', color: tab === 'courses' ? '#fff' : 'var(--gray-500)' }}>
          📚 Courses ({courses.length})
        </button>
        <button onClick={() => setTab('subjects')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          style={{ background: tab === 'subjects' ? 'var(--blue-600)' : 'var(--gray-100)', color: tab === 'subjects' ? '#fff' : 'var(--gray-500)' }}>
          📖 Subjects ({subjects.length})
        </button>
      </div>

      {/* ========== COURSES TAB ========== */}
      {tab === 'courses' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {courses.length === 0 ? (
            <div className="col-span-3 text-center py-16" style={{ color: 'var(--gray-400)' }}>No courses available yet.</div>
          ) : courses.map((course, i) => {
            const isEnrolled = enrolledIds.includes(course._id);
            return (
              <motion.div key={course._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                className="bg-white rounded-[16px] overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                style={{ border: '1px solid var(--gray-200)' }}>
                {/* Top bar */}
                <div className="h-1.5" style={{ background: course.isFree === false ? 'linear-gradient(90deg, #f59e0b, #ef4444)' : 'var(--gradient-blue)' }} />
                {course.image && <img src={course.image} alt={course.title} className="w-full h-36 object-cover" />}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase ${
                      course.level === 'Beginner' ? 'badge-easy' : course.level === 'Intermediate' ? 'badge-medium' : 'badge-hard'
                    }`}>{course.level}</span>
                    {course.isFree === false && course.price > 0 ? (
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706' }}>₹{course.price}</span>
                    ) : (
                      <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#dcfce7', color: '#16a34a' }}>Free</span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: 'var(--gray-900)' }}>{course.title}</h3>
                  <p className="text-xs line-clamp-2 mb-3" style={{ color: 'var(--gray-500)' }}>{course.description}</p>
                  <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--gray-400)' }}>
                    <span className="flex items-center gap-1"><FaClock /> {course.duration}</span>
                    <span>{course.sections?.length || 0} sections</span>
                    {course.instructor && <span>by {course.instructor}</span>}
                  </div>

                  {isEnrolled ? (
                    <button onClick={() => navigate(`/dashboard/course/${course._id}`)}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
                      style={{ background: '#dcfce7', color: '#16a34a' }}>
                      ✅ Continue Learning
                    </button>
                  ) : (
                    <button onClick={() => handleEnroll(course)}
                      className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5"
                      style={{ background: 'var(--gradient-blue)' }}>
                      <FaArrowRight /> Enroll Now
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ========== SUBJECTS TAB ========== */}
      {tab === 'subjects' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.length === 0 ? (
            <div className="col-span-4 text-center py-16" style={{ color: 'var(--gray-400)' }}>No subjects available yet.</div>
          ) : subjects.map((subject, i) => (
            <motion.div key={subject._id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}
              onClick={() => { setSelectedSubject(subject); setActiveTab('notes'); }}
              className="bg-white p-6 rounded-[16px] cursor-pointer text-center shadow-sm transition-all hover:-translate-y-1.5 hover:shadow-lg group"
              style={{ border: '1px solid var(--gray-200)' }}>
              <div className="text-4xl mb-3">{subject.icon}</div>
              <h3 className="font-bold text-lg mb-1 transition-colors group-hover:text-blue-600" style={{ color: 'var(--gray-900)' }}>{subject.name}</h3>
              <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--gray-500)' }}>{subject.description}</p>
              <div className="flex items-center justify-center gap-4 text-xs" style={{ color: 'var(--gray-400)' }}>
                <span>{subject.notes?.length || 0} notes</span>
                <span>{subject.videos?.length || 0} videos</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ========== PAID COURSE POPUP ========== */}
      {enrollPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEnrollPopup(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-md overflow-hidden"
            style={{ border: '1px solid var(--gray-200)' }}>
            <div className="h-2" style={{ background: 'linear-gradient(90deg, #2563eb, #7c3aed, #f59e0b)' }} />
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>💳 Payment Required</h3>
                  <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{enrollPopup.title}</p>
                </div>
                <button onClick={() => setEnrollPopup(null)} className="p-2 rounded-lg hover:bg-gray-100"><HiX style={{ color: 'var(--gray-400)' }} /></button>
              </div>

              <div className="text-center p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)' }}>
                <div className="text-3xl font-extrabold" style={{ color: '#2563eb' }}>₹{enrollPopup.price}</div>
                <p className="text-xs font-medium mt-1" style={{ color: '#6366f1' }}>One-time payment</p>
              </div>

              {enrollPopup.qrCodeImage && (
                <div className="text-center">
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Scan to Pay</p>
                  <img src={enrollPopup.qrCodeImage} alt="QR Code" className="mx-auto rounded-xl shadow-md" style={{ maxWidth: 200, border: '1px solid var(--gray-200)' }} />
                  <p className="text-[0.65rem] mt-2" style={{ color: 'var(--gray-400)' }}>
                    Send <strong>₹{enrollPopup.price}</strong> to the above QR code.<br />You'll receive a coupon within 24hrs.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Enter Coupon Code</label>
                <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className="input-light !text-sm font-mono tracking-wider text-center" placeholder="e.g. VES-A3B7D1"
                  onKeyDown={e => { if (e.key === 'Enter') handleCouponEnroll(); }} />
              </div>

              <button onClick={handleCouponEnroll} disabled={enrolling || !couponCode.trim()}
                className="btn-primary w-full !py-3 disabled:opacity-50">
                {enrolling ? 'Validating...' : '✨ Enroll with Coupon'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Learning;
