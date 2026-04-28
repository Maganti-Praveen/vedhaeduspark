import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, googleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill all fields');
    try {
      const data = await login(email, password);
      toast.success(`Welcome back, ${data.name}!`);
      navigate(data.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Login failed'); }
  };

  // Google Sign-In callback
  const handleGoogleResponse = useCallback(async (response) => {
    if (response.credential) {
      try {
        const data = await googleLogin(response.credential);
        toast.success(`Welcome, ${data.name}!`);
        navigate(data.role === 'admin' ? '/admin' : '/dashboard');
      } catch (err) {
        toast.error(err.response?.data?.message || 'Google login failed');
      }
    }
  }, [googleLogin, navigate]);

  // Load Google Identity Services script
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi')) return;
      const script = document.createElement('script');
      script.id = 'google-gsi';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.google?.accounts?.id?.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google?.accounts?.id?.renderButton(
          document.getElementById('google-signin-btn'),
          { theme: 'outline', size: 'large', width: '100%', text: 'signin_with', shape: 'pill' }
        );
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, [handleGoogleResponse]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[20px] p-10 shadow-xl" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img src="/logo.png" alt="VedhaEduSpark" className="w-16 h-16 mx-auto rounded-xl object-contain shadow-lg" />
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Welcome Back</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>Sign in to your VedhaEduSpark account</p>
          </div>

          {/* Google Sign-In */}
          {GOOGLE_CLIENT_ID && (
            <>
              <div id="google-signin-btn" className="flex justify-center mb-4" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--gray-200)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--gray-400)' }}>or sign in with email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--gray-200)' }} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="input-light !pl-11" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-light !pl-11 !pr-11" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--gray-400)' }}>
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-medium" style={{ color: 'var(--blue-600)' }}>
                Forgot Password?
              </Link>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--gray-500)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--blue-600)' }}>Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
