import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiAcademicCap, HiArrowRight, HiBookOpen } from 'react-icons/hi';
import { enrollmentAPI } from '../../services/api';
import { SkeletonCard } from '../../components/common/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    enrollmentAPI.getAll()
      .then(({ data }) => { setEnrollments(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="skeleton h-10 w-48"></div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--gray-900)' }}>My Courses</h1>
        <p style={{ color: 'var(--gray-500)' }}>Continue learning where you left off</p>
      </motion.div>

      {enrollments.length === 0 ? (
        <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={1}
          className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <HiAcademicCap className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--gray-700)' }}>No courses enrolled yet</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--gray-400)' }}>Explore our courses and start learning!</p>
          <Link to="/courses" className="btn-primary !py-2.5 !px-6 !text-sm inline-flex">Browse Courses</Link>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrollments.map((enr, i) => {
            const course = enr.courseId;
            if (!course) return null;
            const totalSections = course.sections?.length || 0;
            const totalContents = course.sections?.reduce((sum, s) => sum + (s.contents?.length || 0), 0) || 0;
            const completed = enr.completedContents?.length || 0;

            return (
              <motion.div key={enr._id} initial="hidden" animate="visible" variants={fadeUp} custom={i + 1}>
                <Link to={`/dashboard/course/${course._id}`}
                  className="block bg-white rounded-[16px] overflow-hidden shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg group"
                  style={{ border: '1px solid var(--gray-200)' }}>
                  {/* Thumbnail */}
                  {course.image ? (
                    <div className="h-40 overflow-hidden">
                      <img src={course.image} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center" style={{ background: 'var(--gradient-hero)' }}>
                      <HiBookOpen className="text-5xl text-white/30" />
                    </div>
                  )}

                  <div className="p-5">
                    {/* Level + Duration */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[0.65rem] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                        {course.level}
                      </span>
                      {course.duration && (
                        <span className="text-[0.65rem]" style={{ color: 'var(--gray-400)' }}>{course.duration}</span>
                      )}
                    </div>

                    <h3 className="font-bold text-base mb-1 line-clamp-1 transition-colors group-hover:text-blue-600" style={{ color: 'var(--gray-900)' }}>
                      {course.title}
                    </h3>
                    <p className="text-xs mb-4 line-clamp-2" style={{ color: 'var(--gray-500)' }}>{course.description}</p>

                    {/* Stats */}
                    <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--gray-400)' }}>
                      <span>{totalSections} sections</span>
                      <span>•</span>
                      <span>{totalContents} lessons</span>
                      <span>•</span>
                      <span>{completed}/{totalContents} done</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full mb-2" style={{ background: 'var(--gray-100)' }}>
                      <div className="h-full rounded-full transition-all" style={{
                        width: `${enr.progress}%`,
                        background: enr.progress === 100 ? '#22c55e' : 'var(--gradient-blue)',
                      }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold" style={{ color: enr.progress === 100 ? '#16a34a' : 'var(--blue-600)' }}>
                        {enr.progress === 100 ? '✅ Completed!' : `${enr.progress}% complete`}
                      </span>
                      <span className="text-xs font-semibold flex items-center gap-1 transition-colors group-hover:text-blue-600" style={{ color: 'var(--gray-400)' }}>
                        Continue <HiArrowRight />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyCourses;
