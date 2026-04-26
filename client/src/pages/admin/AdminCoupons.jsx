import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiX, HiTicket, HiClipboardCopy } from 'react-icons/hi';
import { couponAPI } from '../../services/api';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genMode, setGenMode] = useState('random'); // 'random' or 'custom'
  const [genCount, setGenCount] = useState(5);
  const [customCodes, setCustomCodes] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    couponAPI.getCourses().then(({ data }) => { setCourses(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const loadCoupons = (courseId) => {
    setCouponsLoading(true);
    couponAPI.getByCourse(courseId).then(({ data }) => { setCoupons(data); setCouponsLoading(false); }).catch(() => setCouponsLoading(false));
  };

  const selectCourse = (course) => {
    setSelectedCourse(course);
    loadCoupons(course._id);
  };

  const handleGenerate = async () => {
    if (!selectedCourse) return;
    setGenerating(true);
    try {
      const body = { courseId: selectedCourse._id };
      if (genMode === 'custom') {
        body.customCodes = customCodes.split('\n').map(c => c.trim()).filter(Boolean);
        if (body.customCodes.length === 0) { toast.error('Enter at least one code'); setGenerating(false); return; }
      } else {
        body.count = genCount;
      }
      const { data } = await couponAPI.generate(body);
      toast.success(data.message);
      loadCoupons(selectedCourse._id);
      setShowGenerate(false);
      setCustomCodes('');
      // Refresh course list for updated counts
      couponAPI.getCourses().then(({ data }) => setCourses(data));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setGenerating(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await couponAPI.delete(id); toast.success('Deleted'); loadCoupons(selectedCourse._id); couponAPI.getCourses().then(({ data }) => setCourses(data)); }
    catch (err) { toast.error(err.response?.data?.message || 'Cannot delete used coupons'); }
  };

  const copyCode = (code) => { navigator.clipboard.writeText(code); toast.success(`Copied: ${code}`); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>🎟️ Coupon Management</h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Create and manage coupons for paid courses</p>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-[16px]" />)}</div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <HiTicket className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No paid courses found</p>
          <p className="text-sm mt-1" style={{ color: 'var(--gray-400)' }}>Create a paid course first to generate coupons</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c, i) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              onClick={() => selectCourse(c)}
              className={`bg-white rounded-[16px] p-5 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md ${selectedCourse?._id === c._id ? 'ring-2 ring-blue-500' : ''}`}
              style={{ border: '1px solid var(--gray-200)' }}>
              <div className="flex items-center gap-3 mb-3">
                {c.image ? <img src={c.image} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--blue-100)' }} />}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate" style={{ color: 'var(--gray-900)' }}>{c.title}</h3>
                  <span className="text-xs font-bold" style={{ color: '#d97706' }}>₹{c.price}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg" style={{ background: 'var(--gray-50)' }}>
                  <div className="text-lg font-bold" style={{ color: 'var(--gray-800)' }}>{c.coupons?.total || 0}</div>
                  <div className="text-[0.6rem] uppercase font-semibold" style={{ color: 'var(--gray-400)' }}>Total</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: '#dcfce7' }}>
                  <div className="text-lg font-bold" style={{ color: '#16a34a' }}>{c.coupons?.available || 0}</div>
                  <div className="text-[0.6rem] uppercase font-semibold" style={{ color: '#16a34a' }}>Available</div>
                </div>
                <div className="p-2 rounded-lg" style={{ background: '#fee2e2' }}>
                  <div className="text-lg font-bold" style={{ color: '#ef4444' }}>{c.coupons?.used || 0}</div>
                  <div className="text-[0.6rem] uppercase font-semibold" style={{ color: '#ef4444' }}>Used</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Course Coupons Detail */}
      {selectedCourse && (
        <div className="bg-white rounded-[16px] p-6 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold" style={{ color: 'var(--gray-900)' }}>Coupons for "{selectedCourse.title}"</h2>
            <button onClick={() => setShowGenerate(true)} className="btn-primary !py-2 !px-4 !text-sm"><HiPlus /> Generate Coupons</button>
          </div>

          {couponsLoading ? (
            <div className="skeleton h-32 rounded-xl" />
          ) : coupons.length === 0 ? (
            <div className="text-center py-8" style={{ color: 'var(--gray-400)' }}>No coupons yet. Generate some!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Code</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Status</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Used By</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Created</th>
                  <th className="text-left py-2 px-3 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Actions</th>
                </tr></thead>
                <tbody>
                  {coupons.map(cp => (
                    <tr key={cp._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-bold font-mono px-2 py-1 rounded" style={{ background: 'var(--gray-100)', color: 'var(--blue-700)' }}>{cp.code}</code>
                          <button onClick={() => copyCode(cp.code)} className="p-1 rounded hover:bg-blue-50" style={{ color: 'var(--gray-400)' }}><HiClipboardCopy /></button>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{
                          background: cp.isUsed ? '#fee2e2' : '#dcfce7',
                          color: cp.isUsed ? '#ef4444' : '#16a34a',
                        }}>{cp.isUsed ? 'Used' : 'Available'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: 'var(--gray-500)' }}>
                        {cp.usedBy ? `${cp.usedBy.name} (${cp.usedBy.email})` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-xs" style={{ color: 'var(--gray-400)' }}>
                        {new Date(cp.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2.5 px-3">
                        {!cp.isUsed && (
                          <button onClick={() => handleDelete(cp._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Generate Modal */}
      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[20px] p-6 w-full max-w-md shadow-2xl" style={{ border: '1px solid var(--gray-200)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>🎟️ Generate Coupons</h3>
              <button onClick={() => setShowGenerate(false)} className="p-1 rounded-lg hover:bg-gray-100"><HiX /></button>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--gray-500)' }}>For: <strong>{selectedCourse?.title}</strong></p>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setGenMode('random')} className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: genMode === 'random' ? 'var(--blue-600)' : 'var(--gray-100)', color: genMode === 'random' ? '#fff' : 'var(--gray-500)' }}>
                🎲 Random Codes
              </button>
              <button onClick={() => setGenMode('custom')} className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: genMode === 'custom' ? 'var(--blue-600)' : 'var(--gray-100)', color: genMode === 'custom' ? '#fff' : 'var(--gray-500)' }}>
                ✏️ Custom Codes
              </button>
            </div>

            {genMode === 'random' ? (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Number of Coupons</label>
                <input type="number" value={genCount} onChange={e => setGenCount(Math.max(1, Math.min(100, Number(e.target.value))))}
                  className="input-light !text-sm" min="1" max="100" />
                <p className="text-[0.65rem] mt-1" style={{ color: 'var(--gray-400)' }}>Codes like VES-A3B7D1 will be auto-generated</p>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Enter Codes (one per line)</label>
                <textarea value={customCodes} onChange={e => setCustomCodes(e.target.value)} rows={5}
                  className="input-light !text-sm resize-y font-mono" placeholder={`WELCOME100\nSPECIAL50\nEARLYBIRD`} />
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={handleGenerate} disabled={generating} className="btn-primary !py-2.5 !px-6 !text-sm flex-1 disabled:opacity-50">
                {generating ? 'Generating...' : 'Generate'}
              </button>
              <button onClick={() => setShowGenerate(false)} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
