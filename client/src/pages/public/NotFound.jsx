import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
      {/* Floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute rounded-full opacity-10" style={{ width: 400, height: 400, background: '#3b82f6', top: '-10%', right: '-8%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-10" style={{ width: 300, height: 300, background: '#f97316', bottom: '-5%', left: '-5%', filter: 'blur(80px)' }} />
        <div className="absolute rounded-full opacity-8" style={{ width: 200, height: 200, background: '#8b5cf6', top: '40%', left: '15%', filter: 'blur(60px)' }} />
      </div>

      <div className="text-center relative z-10 max-w-lg w-full">
        {/* Large 404 */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, duration: 0.8 }}
          className="mb-6"
        >
          <h1 className="font-extrabold leading-none select-none" style={{
            fontSize: 'clamp(100px, 20vw, 180px)',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: 'none',
          }}>
            404
          </h1>
        </motion.div>

        {/* Message card */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-xl rounded-[24px] p-8 mb-8"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">Page Not Found</h2>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
            Oops! The page you're looking for doesn't exist or has been moved.
            <br />Let's get you back on track.
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link
            to="/"
            className="px-8 py-3.5 rounded-xl font-bold text-white text-sm transition-all hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
            }}
          >
            🏠 Go Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.8)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            ← Go Back
          </button>
          <Link
            to="/courses"
            className="px-8 py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              color: '#fff',
              boxShadow: '0 4px 20px rgba(249,115,22,0.3)',
            }}
          >
            📚 Browse Courses
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-10 text-xs"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          VedhaEduSpark • All-in-One CSE Learning Platform
        </motion.p>
      </div>
    </div>
  );
};

export default NotFound;
