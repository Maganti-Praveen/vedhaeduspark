import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaRocket, FaCompass, FaArrowRight, FaStar, FaLaptopCode, FaUsersCog, FaCertificate, FaBriefcase, FaQuoteLeft, FaCheckCircle } from 'react-icons/fa';
import { HiAcademicCap, HiLightningBolt, HiChartBar } from 'react-icons/hi';
import { courseAPI } from '../../services/api';
import { SkeletonCard } from '../../components/common/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.7, ease: 'easeOut' } }),
};

const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    courseAPI.getAll().then(({ data }) => {
      setCourses(data.slice(0, 6));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const stats = [
    { value: '500+', label: 'Students Trained' },
    { value: '10+', label: 'Expert Mentors' },
    { value: '95%', label: 'Placement Rate' },
  ];

  const features = [
    { icon: <FaLaptopCode />, title: 'Hands-On Training', desc: 'Learn by building real-world projects from day one', colorClass: 'fi-blue' },
    { icon: <FaUsersCog />, title: 'Expert Mentors', desc: 'Industry professionals guide your learning journey', colorClass: 'fi-orange' },
    { icon: <FaCertificate />, title: 'Certified Courses', desc: 'Earn industry-recognized certificates upon completion', colorClass: 'fi-green' },
    { icon: <FaBriefcase />, title: 'Career Support', desc: 'Placement assistance and interview preparation', colorClass: 'fi-purple' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma', role: 'SDE at Google', initials: 'PS',
      text: 'VedhaEduSpark helped me crack my dream job. The structured DSA roadmap and practice problems were invaluable.',
      gradient: 'var(--gradient-blue)',
    },
    {
      name: 'Rahul Verma', role: 'Final Year CSE', initials: 'RV',
      text: 'The best platform for CS students. Notes, videos, and coding practice all in one place. Highly recommended!',
      gradient: 'var(--gradient-orange)',
    },
    {
      name: 'Ananya Patel', role: 'SDE Intern at Microsoft', initials: 'AP',
      text: 'The online IDE is fantastic! Being able to practice coding problems with instant feedback made all the difference.',
      gradient: 'linear-gradient(135deg, #16a34a, #4ade80)',
    },
  ];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="hero-bg min-h-screen flex items-center relative overflow-hidden">
        {/* Floating shapes */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full opacity-[0.08]" style={{ width: 300, height: 300, background: 'var(--orange-500)', top: '10%', right: '-5%', animation: 'floatShape 20s infinite ease-in-out' }} />
          <div className="absolute rounded-full opacity-[0.08]" style={{ width: 200, height: 200, background: 'var(--blue-400)', bottom: '20%', left: '-3%', animation: 'floatShape 20s infinite ease-in-out', animationDelay: '-5s' }} />
          <div className="absolute rounded-full opacity-[0.08]" style={{ width: 150, height: 150, background: 'var(--orange-400)', top: '40%', left: '20%', animation: 'floatShape 20s infinite ease-in-out', animationDelay: '-10s' }} />
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-[-2px] left-0 w-full z-[2]">
          <svg viewBox="0 0 1440 120" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="block w-full">
            <path fill="#f9fafb" d="M0,64 C360,120 720,0 1080,64 C1260,96 1380,80 1440,72 L1440,120 L0,120 Z" />
          </svg>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 pt-36 pb-28 sm:pt-40 sm:pb-32 relative z-[1] grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Hero Content */}
          <div className="text-white lg:text-left text-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium mb-6 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" style={{ animation: 'pulse 2s infinite' }} />
                Admissions Open 2026
              </div>
            </motion.div>

            <motion.h1 initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="text-4xl sm:text-5xl lg:text-[3.2rem] font-extrabold leading-tight mb-5"
            >
              Empower Your Future with{' '}
              <span className="gradient-text-orange">In-Demand Tech Skills</span>
            </motion.h1>

            <motion.p initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="text-lg opacity-90 leading-relaxed mb-9 max-w-[520px] lg:mx-0 mx-auto"
            >
              Learn <strong>Data Structures</strong>, <strong>DBMS</strong>, <strong>OS</strong>, <strong>CN</strong> and practice coding with our built-in IDE. Master CS fundamentals with expert mentorship.
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3}
              className="flex gap-4 flex-wrap lg:justify-start justify-center"
            >
              <Link to="/register" className="btn-primary">
                <FaRocket /> Enroll Now
              </Link>
              <Link to="/courses" className="btn-secondary">
                <FaCompass /> Explore Courses
              </Link>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4}
              className="flex gap-6 sm:gap-10 mt-10 lg:justify-start justify-center flex-wrap"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-extrabold" style={{ color: 'var(--orange-400)' }}>{stat.value}</div>
                  <div className="text-sm opacity-75 mt-1">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Image Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hidden lg:flex justify-center"
          >
            <div
              className="relative rounded-[20px] p-5 backdrop-blur-xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <div className="w-full max-w-[480px] h-[340px] rounded-xl bg-gradient-to-br from-blue-400/20 to-orange-400/20 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">🎓</div>
                  <div className="text-xl font-bold">CSE Learning Platform</div>
                  <div className="text-sm opacity-70 mt-1">Learn • Code • Grow</div>
                </div>
              </div>

              {/* Floating badges — hidden on small screens to prevent overflow */}
              <div
                className="absolute top-[-10px] left-[-20px] hidden xl:flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold animate-float"
                style={{ color: 'var(--gray-800)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center fi-blue text-sm">📊</div>
                Data Analytics
              </div>
              <div
                className="absolute bottom-5 right-[-10px] hidden xl:flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold animate-float"
                style={{ color: 'var(--gray-800)', animationDelay: '-1.5s' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center fi-orange text-sm">💻</div>
                Web Dev
              </div>
              <div
                className="absolute bottom-[-15px] left-8 hidden xl:flex items-center gap-2 bg-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold animate-float"
                style={{ color: 'var(--gray-800)', animationDelay: '-0.8s' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center fi-green text-sm">🧠</div>
                AI Powered
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURES STRIP ============ */}
      <section className="py-16" style={{ background: 'var(--gray-50)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="text-center p-8 rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg"
                style={{ border: '1px solid var(--gray-100)' }}
              >
                <div className={`w-[60px] h-[60px] rounded-[14px] flex items-center justify-center mx-auto mb-4 text-2xl ${f.colorClass}`}>
                  {f.icon}
                </div>
                <h4 className="text-base font-bold mb-1.5" style={{ color: 'var(--gray-900)' }}>{f.title}</h4>
                <p className="text-sm" style={{ color: 'var(--gray-500)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ COURSES PREVIEW ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-[1200px] mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="badge-blue mb-4 inline-block">Our Programs</span>
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: 'var(--gray-900)' }}>
              Master <span className="gradient-text">In-Demand Skills</span>
            </h2>
            <p className="text-lg max-w-[600px] mx-auto" style={{ color: 'var(--gray-500)' }}>
              Choose from our carefully designed courses to kickstart your career in tech
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : courses.map((course, i) => (
                  <motion.div key={course._id} variants={fadeUp} custom={i}>
                    <Link to="/courses" className="block bg-white rounded-[20px] overflow-hidden shadow-md border transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                      style={{ borderColor: 'var(--gray-200)' }}
                    >
                      <div className="h-1 w-full" style={{ background: i % 2 === 0 ? 'var(--gradient-blue)' : 'var(--gradient-orange)' }} />
                      <div className="p-7">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            course.level === 'Beginner' ? 'badge-easy' :
                            course.level === 'Intermediate' ? 'badge-medium' : 'badge-hard'
                          }`}>
                            {course.level}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-2 transition-colors group-hover:text-blue-600"
                          style={{ color: 'var(--gray-900)' }}
                        >
                          {course.title}
                        </h3>
                        <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: 'var(--gray-500)' }}>
                          {course.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-5">
                          {course.topics?.slice(0, 4).map((topic, j) => (
                            <span key={j} className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
                              style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
                          <div className="flex items-center gap-1 text-sm font-semibold" style={{ color: 'var(--orange-500)' }}>
                            <FaStar /> {course.rating}
                          </div>
                          <span className="text-sm font-medium flex items-center gap-1 transition-all group-hover:gap-2"
                            style={{ color: 'var(--blue-600)' }}
                          >
                            Learn More <FaArrowRight className="text-xs" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))
            }
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mt-14">
            <Link to="/courses" className="btn-outline inline-flex items-center gap-2">
              <FaArrowRight /> View All Courses
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'var(--blue-900)' }}>
        {/* Decorative circle */}
        <div className="absolute rounded-full opacity-5" style={{ width: 400, height: 400, background: 'var(--orange-500)', top: -100, right: -100 }} />

        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
            <span className="badge-orange mb-4 inline-block">Student Stories</span>
            <h2 className="text-4xl font-extrabold text-white mb-4">
              What Our <span className="gradient-text-orange">Students Say</span>
            </h2>
            <p className="text-lg max-w-[600px] mx-auto" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Hear from students who transformed their careers with Vedha EduSpark
            </p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-7"
          >
            {testimonials.map((t, i) => (
              <motion.div key={i} variants={fadeUp} custom={i}
                className="glass-card p-8 group cursor-default"
              >
                <div className="flex gap-1 mb-4 text-sm" style={{ color: 'var(--orange-400)' }}>
                  {Array.from({ length: 5 }).map((_, j) => <FaStar key={j} />)}
                </div>
                <p className="text-[0.95rem] leading-relaxed mb-5 italic" style={{ color: 'rgba(255,255,255,0.8)' }}>
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: t.gradient }}>
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{t.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-6 leading-tight" style={{ color: 'var(--gray-900)' }}>
              Ready to Start Your <span className="gradient-text-orange">Tech Journey</span>?
            </h2>
            <p className="text-base sm:text-lg mb-10 max-w-2xl mx-auto" style={{ color: 'var(--gray-500)' }}>
              Join thousands of students who are already learning and growing with VedhaEduSpark.
            </p>
            <Link to="/register" className="btn-primary text-lg !py-4 !px-10 inline-flex items-center gap-2">
              <FaRocket /> Enroll Now — It's Free
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
