import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShieldAlt, FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const CreateAdmin = () => {
  const [step, setStep] = useState(1); // 1 = secret code, 2 = admin details
  const [secretCode, setSecretCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const navigate = useNavigate();

  const verifyCode = (e) => {
    e.preventDefault();
    if (!secretCode.trim()) return toast.error('Please enter the secret code');
    // Client-side: just move to step 2. Real verification happens on submit.
    setVerified(true);
    setStep(2);
    toast.success('Code accepted. Fill in admin details.');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await authAPI.createAdmin({ secretCode, name, email, password });
      toast.success(`Admin account created for ${data.name}!`);
      // Auto-login as admin
      localStorage.setItem('ves_user', JSON.stringify(data));
      window.location.href = '/admin';
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create admin';
      toast.error(msg);
      if (msg.includes('secret code') || msg.includes('Access denied')) {
        setStep(1);
        setVerified(false);
        setSecretCode('');
      }
    }
    setLoading(false);
  };

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
            <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>
              {step === 1 ? '🔐 Admin Access' : '👤 Create Admin'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
              {step === 1 ? 'Enter the secret code to proceed' : 'Fill in the admin account details'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: step >= 1 ? 'var(--blue-600)' : 'var(--gray-300)' }}>1</div>
              <span className="text-xs font-medium" style={{ color: step >= 1 ? 'var(--blue-600)' : 'var(--gray-400)' }}>Verify</span>
            </div>
            <div className="w-8 h-px" style={{ background: 'var(--gray-300)' }} />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: step >= 2 ? 'var(--blue-600)' : 'var(--gray-300)' }}>2</div>
              <span className="text-xs font-medium" style={{ color: step >= 2 ? 'var(--blue-600)' : 'var(--gray-400)' }}>Create</span>
            </div>
          </div>

          {/* Step 1: Secret Code */}
          {step === 1 && (
            <form onSubmit={verifyCode} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Secret Code</label>
                <div className="relative">
                  <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                  <input type="password" value={secretCode} onChange={e => setSecretCode(e.target.value)}
                    className="input-light !pl-11" placeholder="Enter admin secret code" autoFocus />
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--gray-400)' }}>
                  Contact the system administrator if you don't have the code.
                </p>
              </div>
              <button type="submit" className="btn-primary w-full justify-center !py-3.5">
                Verify & Continue →
              </button>
            </form>
          )}

          {/* Step 2: Admin Details */}
          {step === 2 && (
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="p-3 rounded-xl text-xs flex items-center gap-2 mb-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a' }}>
                <FaShieldAlt /> <span className="font-semibold">Secret code verified. Create your admin account below.</span>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Full Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="input-light !pl-11" placeholder="Admin Name" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Email</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="input-light !pl-11" placeholder="admin@vedhaeduspark.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Password</label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--gray-300)' }} />
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                    className="input-light !pl-11 !pr-11" placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: 'var(--gray-400)' }}>
                    {showPass ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setStep(1); setVerified(false); }}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'var(--gray-100)', color: 'var(--gray-600)' }}>
                  <FaArrowLeft /> Back
                </button>
                <button type="submit" disabled={loading}
                  className="btn-primary flex-1 justify-center !py-3 disabled:opacity-50">
                  {loading ? '⏳ Creating...' : '🛡️ Create Admin'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm mt-6" style={{ color: 'var(--gray-500)' }}>
            <Link to="/login" className="font-semibold" style={{ color: 'var(--blue-600)' }}>← Back to Login</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateAdmin;
