import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email');
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[20px] p-10 shadow-xl" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-lg mx-auto"
                style={{ background: 'var(--gradient-orange)', boxShadow: 'var(--shadow-orange)' }}
              >
                V
              </div>
            </Link>

            {!sent ? (
              <>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Forgot Password?</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
                  Enter your email and we'll send you a reset link
                </p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">📧</div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Check Your Email</h1>
                <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--gray-500)' }}>
                  We've sent a password reset link to <strong style={{ color: 'var(--blue-600)' }}>{email}</strong>.
                  The link is valid for <strong>15 minutes</strong>.
                </p>
              </>
            )}
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-light !pl-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center !py-3.5 disabled:opacity-50"
              >
                {loading ? (
                  'Sending...'
                ) : (
                  <><FaPaperPlane /> Send Reset Link</>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-outline w-full justify-center !py-3"
              >
                Try Another Email
              </button>
            </div>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'var(--gray-500)' }}>
            <Link to="/login" className="font-semibold inline-flex items-center gap-1" style={{ color: 'var(--blue-600)' }}>
              <FaArrowLeft className="text-xs" /> Back to Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
