import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { register, googleLogin, loading } = useAuth();
  const navigate = useNavigate();

  const handleGoogleResponse = useCallback(async (response) => {
    if (response.credential) {
      try {
        const data = await googleLogin(response.credential);
        toast.success(`Welcome, ${data.name}!`);
        navigate('/dashboard');
      } catch (err) { toast.error(err.response?.data?.message || 'Google signup failed'); }
    }
  }, [googleLogin, navigate]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const loadGoogleScript = () => {
      if (document.getElementById('google-gsi-reg')) return;
      const script = document.createElement('script');
      script.id = 'google-gsi-reg';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true; script.defer = true;
      script.onload = () => {
        window.google?.accounts?.id?.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleResponse });
        window.google?.accounts?.id?.renderButton(document.getElementById('google-signup-btn'), { theme: 'outline', size: 'large', width: '100%', text: 'signup_with', shape: 'pill' });
      };
      document.body.appendChild(script);
    };
    loadGoogleScript();
  }, [handleGoogleResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    if (password !== confirmPassword) return toast.error('Passwords do not match');
    try { await register(name, email, password); toast.success('Account created!'); navigate('/dashboard'); }
    catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-28 hero-bg">
      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-[20px] p-10 shadow-xl" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <img src="/logo.png" alt="VedhaEduSpark" className="w-16 h-16 mx-auto rounded-xl object-contain shadow-lg" />
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Create Account</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>Join VedhaEduSpark and start learning</p>
          </div>

          {GOOGLE_CLIENT_ID && (
            <>
              <div id="google-signup-btn" className="flex justify-center mb-4" />
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px" style={{ background: 'var(--gray-200)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--gray-400)' }}>or sign up with email</span>
                <div className="flex-1 h-px" style={{ background: 'var(--gray-200)' }} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-light !pl-11" placeholder="John Doe" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-light !pl-11" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  className="input-light !pl-11 !pr-11" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: 'var(--gray-400)' }}>{showPass ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Confirm Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-light !pl-11" placeholder="••••••••" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-3.5 disabled:opacity-50 mt-2">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--gray-500)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--blue-600)' }}>Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
