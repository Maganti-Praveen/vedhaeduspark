import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaArrowRight, FaSearch, FaClock, FaUsers, FaCheck, FaTimes } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { courseAPI, enrollmentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonCard } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const Courses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  // Enrollment popup state
  const [enrollPopup, setEnrollPopup] = useState(null); // course object
  const [couponCode, setCouponCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    courseAPI.getAll().then(({ data }) => { setCourses(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = courses.filter(c => {
    const matchLevel = filter === 'All' || c.level === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const handleEnrollClick = (course) => {
    if (!user) { toast.error('Please login to enroll'); navigate('/login'); return; }
    // If free → enroll directly
    if (course.isFree !== false || !course.price) {
      enrollDirect(course._id);
    } else {
      // Paid → show popup
      setEnrollPopup(course);
      setCouponCode('');
    }
  };

  const enrollDirect = async (courseId) => {
    try { await enrollmentAPI.enroll(courseId); toast.success('Enrolled successfully!'); navigate('/dashboard/my-courses'); }
    catch (err) { toast.error(err.response?.data?.message || 'Enrollment failed'); }
  };

  const handleCouponEnroll = async () => {
    if (!couponCode.trim()) return toast.error('Enter a coupon code');
    setEnrolling(true);
    try {
      await enrollmentAPI.enroll(enrollPopup._id, couponCode.trim());
      toast.success('Enrolled successfully!');
      setEnrollPopup(null);
      navigate('/dashboard/my-courses');
    } catch (err) { toast.error(err.response?.data?.message || 'Invalid coupon'); }
    setEnrolling(false);
  };

  return (
    <div className="min-h-screen pt-32 pb-20" style={{ background: 'var(--white)' }}>
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center mb-14">
          <span className="badge-blue mb-4 inline-block">Our Programs</span>
          <h1 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--gray-900)' }}>
            Master <span className="gradient-text">In-Demand Skills</span>
          </h1>
          <p className="text-lg max-w-[600px] mx-auto" style={{ color: 'var(--gray-500)' }}>
            Choose from our carefully designed courses to kickstart your career in tech
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-10"
        >
          <div className="flex gap-2 flex-wrap">
            {levels.map((level) => (
              <button key={level} onClick={() => setFilter(level)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: filter === level ? 'var(--blue-600)' : 'var(--gray-100)',
                  color: filter === level ? 'var(--white)' : 'var(--gray-700)',
                  boxShadow: filter === level ? 'var(--shadow-blue)' : 'none',
                }}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-64">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
            <input type="text" placeholder="Search courses..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-light !pl-11 !py-3" />
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-10">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.map((course, i) => (
                <motion.div key={course._id} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                  className="bg-white rounded-[20px] overflow-hidden shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                  style={{ border: '1px solid var(--gray-200)', position: 'relative' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-1"
                    style={{ background: i % 2 === 0 ? 'var(--gradient-blue)' : 'var(--gradient-orange)' }} />
                  <div className="p-7">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        course.level === 'Beginner' ? 'badge-easy' :
                        course.level === 'Intermediate' ? 'badge-medium' : 'badge-hard'
                      }`}>{course.level}</span>
                      {course.isFree === false && course.price > 0 ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#fef3c7', color: '#d97706' }}>₹{course.price}</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#dcfce7', color: '#16a34a' }}>Free</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--gray-900)' }}>{course.title}</h3>
                    <p className="text-[0.95rem] leading-relaxed mb-5" style={{ color: 'var(--gray-500)' }}>{course.description}</p>

                    <div className="flex flex-wrap gap-2 mb-5">
                      {course.topics?.slice(0, 5).map((topic, j) => (
                        <span key={j} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                          style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>
                          {topic}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-2 mb-5 pt-5" style={{ borderTop: '1px solid var(--gray-200)' }}>
                      {['Real-world projects', 'Expert mentorship', 'Career support'].map((feat, j) => (
                        <div key={j} className="flex items-center gap-1.5 text-xs sm:text-sm" style={{ color: 'var(--gray-700)' }}>
                          <span className="w-4 h-4 rounded-full flex items-center justify-center text-[0.5rem] flex-shrink-0"
                            style={{ background: i % 2 === 0 ? 'var(--blue-100)' : 'var(--orange-100)', color: i % 2 === 0 ? 'var(--blue-700)' : 'var(--orange-600)' }}>
                            <FaCheck />
                          </span>
                          {feat}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-5" style={{ borderTop: '1px solid var(--gray-200)' }}>
                      <button onClick={() => handleEnrollClick(course)} className="btn-outline !py-3 !px-7 text-sm">
                        <FaArrowRight /> Enroll Now
                      </button>
                      <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--gray-500)' }}>
                        <FaClock /> {course.duration}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
          }
        </div>

        {!loading && filtered.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--gray-900)' }}>No courses found</h3>
            <p style={{ color: 'var(--gray-500)' }}>Try adjusting your filters or search term.</p>
          </div>
        )}

        {/* ============ PAID COURSE ENROLLMENT POPUP ============ */}
        {enrollPopup && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEnrollPopup(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative bg-white rounded-[20px] shadow-2xl w-full max-w-md overflow-hidden"
              style={{ border: '1px solid var(--gray-200)' }}>
              {/* Header gradient */}
              <div className="h-2" style={{ background: 'linear-gradient(90deg, #2563eb, #7c3aed, #f59e0b)' }} />
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>💳 Payment Required</h3>
                    <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{enrollPopup.title}</p>
                  </div>
                  <button onClick={() => setEnrollPopup(null)} className="p-2 rounded-lg hover:bg-gray-100"><HiX style={{ color: 'var(--gray-400)' }} /></button>
                </div>

                {/* Price */}
                <div className="text-center p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)' }}>
                  <div className="text-3xl font-extrabold" style={{ color: '#2563eb' }}>₹{enrollPopup.price}</div>
                  <p className="text-xs font-medium mt-1" style={{ color: '#6366f1' }}>One-time payment</p>
                </div>

                {/* QR Code */}
                {enrollPopup.qrCodeImage && (
                  <div className="text-center">
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Scan to Pay</p>
                    <img src={enrollPopup.qrCodeImage} alt="Payment QR Code" className="mx-auto rounded-xl shadow-md" style={{ maxWidth: 200, border: '1px solid var(--gray-200)' }} />
                    <p className="text-[0.65rem] mt-2 leading-relaxed" style={{ color: 'var(--gray-400)' }}>
                      Send <strong>₹{enrollPopup.price}</strong> to the above QR code.<br />
                      You'll receive a coupon code to your mail within 24hrs.
                    </p>
                  </div>
                )}

                {/* Coupon Input */}
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--gray-700)' }}>Enter Coupon Code</label>
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    className="input-light !text-sm font-mono tracking-wider text-center"
                    placeholder="e.g. VES-A3B7D1"
                    onKeyDown={e => { if (e.key === 'Enter') handleCouponEnroll(); }}
                  />
                </div>

                <button onClick={handleCouponEnroll} disabled={enrolling || !couponCode.trim()}
                  className="btn-primary w-full !py-3 disabled:opacity-50">
                  {enrolling ? 'Validating...' : '✨ Enroll with Coupon'}
                </button>

                {/* Payment Instructions */}
                <div className="p-3.5 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
                  <p className="text-xs font-bold mb-1.5" style={{ color: '#92400e' }}>💳 How to Pay</p>
                  <p className="text-[0.7rem] leading-relaxed" style={{ color: '#78350f' }}>
                    Pay <strong>₹{enrollPopup.price}</strong> and send payment screenshot, your email ID &amp; course name to:
                  </p>
                  <div className="mt-1.5 space-y-0.5">
                    <p className="text-[0.7rem] font-bold" style={{ color: '#92400e' }}>📧 vedhaedusparkcenter@gmail.com</p>
                    <p className="text-[0.7rem] font-bold" style={{ color: '#92400e' }}>📱 9391640022</p>
                  </div>
                  <p className="text-[0.6rem] mt-1.5" style={{ color: '#a16207' }}>You'll receive a coupon code after verification.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
