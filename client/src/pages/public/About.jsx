import { motion } from 'framer-motion';
import { FaLaptopCode, FaProjectDiagram, FaChalkboardTeacher, FaHandshake, FaPhoneAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const About = () => {
  const highlights = [
    { icon: <FaLaptopCode />, title: 'Hands-On Training', desc: 'Project-based curriculum', colorClass: 'fi-blue' },
    { icon: <FaProjectDiagram />, title: 'Real-Time Projects', desc: 'Industry-relevant tasks', colorClass: 'fi-orange' },
    { icon: <FaChalkboardTeacher />, title: 'Expert Faculty', desc: 'Experienced instructors', colorClass: 'fi-green' },
    { icon: <FaHandshake />, title: 'Career Guidance', desc: 'Placement support', colorClass: 'fi-purple' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero wave top */}
      <section className="pt-32 pb-24" style={{ background: 'var(--gray-50)' }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-[20px] overflow-hidden shadow-lg bg-gradient-to-br from-blue-100 to-orange-50 aspect-[4/3] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-7xl mb-4">🎓</div>
                  <div className="text-2xl font-bold" style={{ color: 'var(--blue-700)' }}>VedhaEduSpark Centre</div>
                  <div className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>Empowering Learners Since 2024</div>
                </div>
              </div>
              <div className="absolute bottom-[-20px] right-[-20px] w-[120px] h-[120px] rounded-[20px] -z-10 opacity-30"
                style={{ background: 'var(--gradient-orange)' }} />
            </motion.div>

            {/* Content */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
              <span className="badge-orange mb-4 inline-block">About Us</span>
              <h1 className="text-4xl font-extrabold mb-5 leading-tight" style={{ color: 'var(--gray-900)' }}>
                Empowering Learners for <span className="gradient-text-orange">Tomorrow's World</span>
              </h1>
              <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--gray-500)' }}>
                <strong style={{ color: 'var(--gray-800)' }}>Vedha EduSpark Centre</strong> is a modern training institute focused on practical, job-ready skills.
                We believe in learning by doing — every course includes real-time projects, mentorship, and career guidance
                to help you succeed in the competitive tech industry.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {highlights.map((h, i) => (
                  <motion.div key={i} initial="hidden" animate="visible" variants={fadeUp} custom={i}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0 ${h.colorClass}`}>
                      {h.icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold" style={{ color: 'var(--gray-900)' }}>{h.title}</h4>
                      <p className="text-xs" style={{ color: 'var(--gray-500)' }}>{h.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Link to="/contact" className="btn-primary">
                <FaPhoneAlt /> Get In Touch
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
