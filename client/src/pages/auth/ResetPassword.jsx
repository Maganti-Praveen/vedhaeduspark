import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(token, password);
      setSuccess(true);
      toast.success(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. The link may have expired.');
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

            {!success ? (
              <>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Create New Password</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
                  Your new password must be at least 6 characters
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center text-3xl"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>
                  <FaCheckCircle />
                </div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Password Reset!</h1>
                <p className="text-sm mt-2" style={{ color: 'var(--gray-500)' }}>
                  Your password has been successfully updated. You can now login with your new password.
                </p>
              </>
            )}
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>
                  New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-light !pl-11 !pr-11"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: 'var(--gray-400)' }}
                  >
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-light !pl-11"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center !py-3.5 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          ) : (
            <Link to="/login" className="btn-primary w-full justify-center !py-3.5 block text-center">
              Go to Login →
            </Link>
          )}

          {!success && (
            <p className="text-center text-sm mt-6" style={{ color: 'var(--gray-500)' }}>
              <Link to="/login" className="font-semibold" style={{ color: 'var(--blue-600)' }}>
                ← Back to Login
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
