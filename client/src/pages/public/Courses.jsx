import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStar, FaArrowRight, FaSearch, FaClock, FaUsers, FaCheck } from 'react-icons/fa';
import { courseAPI, enrollmentAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SkeletonCard } from '../../components/common/Skeleton';
import toast from 'react-hot-toast';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    courseAPI.getAll().then(({ data }) => { setCourses(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced'];
  const filtered = courses.filter((c) => {
    const matchLevel = filter === 'All' || c.level === filter;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchLevel && matchSearch;
  });

  const handleEnroll = async (courseId) => {
    if (!user) { toast.error('Please login to enroll'); navigate('/login'); return; }
    try { await enrollmentAPI.enroll(courseId); toast.success('Enrolled successfully!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.message || 'Enrollment failed'); }
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
                      <button onClick={() => handleEnroll(course._id)} className="btn-outline !py-3 !px-7 text-sm">
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
      </div>
    </div>
  );
};

export default Courses;
