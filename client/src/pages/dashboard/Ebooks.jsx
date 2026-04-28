import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBook, FaSearch, FaDownload, FaStar } from 'react-icons/fa';
import { HiX } from 'react-icons/hi';
import { ebookAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Programming', 'DSA', 'Web Development', 'Database', 'Computer Science', 'AI & ML', 'Interview Prep', 'Other'];

const Ebooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState(null); // ebook detail popup
  const [couponCode, setCouponCode] = useState('');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    ebookAPI.getAll().then(({ data }) => { setEbooks(data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const filtered = ebooks.filter(e => {
    if (category !== 'All' && e.category !== category) return false;
    if (search && !e.title.toLowerCase().includes(search.toLowerCase()) && !e.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const openDetail = async (ebook) => {
    try {
      const { data } = await ebookAPI.getById(ebook._id);
      setSelected(data);
      setCouponCode('');
    } catch { setSelected({ ...ebook, hasAccess: false }); }
  };

  const requestAccess = async () => {
    if (!selected) return;
    setRequesting(true);
    try {
      const { data } = await ebookAPI.requestAccess(selected._id, couponCode.trim() || undefined);
      toast.success(data.message);
      setSelected(prev => ({ ...prev, hasAccess: true, pdfUrl: data.pdfUrl }));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setRequesting(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>📚 E-Book Library</h1>
        <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Browse and access our collection of learning resources</p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--gray-400)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} className="input-light !text-sm !pl-9" placeholder="Search e-books..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={{ background: category === c ? 'var(--blue-600)' : 'var(--gray-100)', color: category === c ? '#fff' : 'var(--gray-500)' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* E-Book Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-64 rounded-[16px]" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <FaBook className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No e-books found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e, i) => (
            <motion.div key={e._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }}
              onClick={() => openDetail(e)}
              className="bg-white rounded-[16px] shadow-sm cursor-pointer transition-all hover:-translate-y-1 hover:shadow-md overflow-hidden group"
              style={{ border: '1px solid var(--gray-200)' }}>
              {/* Cover */}
              <div className="h-40 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #7c3aed15, #2563eb15)' }}>
                {e.image ? <img src={e.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> :
                  <div className="flex items-center justify-center h-full text-5xl opacity-30">📚</div>}
                <span className="absolute top-3 right-3 text-[0.65rem] font-bold px-2.5 py-1 rounded-full" style={{
                  background: e.isFree ? '#dcfce7' : '#fef3c7', color: e.isFree ? '#16a34a' : '#d97706'
                }}>{e.isFree ? '✅ Free' : `₹${e.price}`}</span>
              </div>
              {/* Info */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#ede9fe', color: '#7c3aed' }}>{e.category}</span>
                  {e.accessMode !== 'website' && <span className="text-[0.6rem]" style={{ color: 'var(--gray-400)' }}>📧</span>}
                </div>
                <h3 className="font-bold text-sm mb-1 line-clamp-2" style={{ color: 'var(--gray-900)' }}>{e.title}</h3>
                <p className="text-xs mb-3 line-clamp-2" style={{ color: 'var(--gray-400)' }}>{e.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: 'var(--gray-400)' }}>by {e.author}</span>
                  <span className="text-xs" style={{ color: 'var(--gray-400)' }}>{e.downloadCount || 0} downloads</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Detail/Access Popup ── */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[20px] w-full max-w-lg shadow-2xl overflow-hidden" style={{ border: '1px solid var(--gray-200)' }}>
              {/* Header */}
              <div className="relative h-48" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                {selected.image && <img src={selected.image} className="w-full h-full object-cover opacity-30" />}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-xl font-bold text-white text-center px-6">{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 p-2 rounded-full bg-white/20 text-white hover:bg-white/40"><HiX /></button>
              </div>
              {/* Body */}
              <div className="p-6 space-y-4 max-h-[50vh] overflow-y-auto">
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: '#ede9fe', color: '#7c3aed' }}>{selected.category}</span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                    background: selected.isFree ? '#dcfce7' : '#fef3c7', color: selected.isFree ? '#16a34a' : '#d97706'
                  }}>{selected.isFree ? 'Free' : `₹${selected.price}`}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'var(--gray-100)', color: 'var(--gray-500)' }}>by {selected.author}</span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--gray-600)' }}>{selected.description}</p>

                {/* Access Section */}
                {selected.hasAccess ? (
                  <div className="p-4 rounded-xl text-center" style={{ background: '#dcfce7' }}>
                    <p className="text-sm font-bold mb-3" style={{ color: '#16a34a' }}>✅ You have access!</p>
                    {selected.pdfUrl && (selected.accessMode === 'website' || selected.accessMode === 'both') && (
                      <a href={selected.pdfUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)' }}>
                        <FaDownload /> Open / Download PDF
                      </a>
                    )}
                    {(selected.accessMode === 'email') && (
                      <p className="text-xs mt-2" style={{ color: '#16a34a' }}>📧 The PDF will be sent to your email by admin.</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selected.isFree ? (
                      <button onClick={requestAccess} disabled={requesting} className="btn-primary w-full !py-3 disabled:opacity-50">
                        {requesting ? 'Processing...' : '📖 Get Free Access'}
                      </button>
                    ) : (
                      <>
                        {/* Payment Instructions */}
                        <div className="text-center p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, #dbeafe, #ede9fe)' }}>
                          <div className="text-3xl font-extrabold" style={{ color: '#2563eb' }}>₹{selected.price}</div>
                          <p className="text-xs font-medium mt-1" style={{ color: '#6366f1' }}>One-time payment</p>
                        </div>

                        {/* QR Code */}
                        {selected.qrCodeImage && (
                          <div className="text-center">
                            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Scan to Pay</p>
                            <img src={selected.qrCodeImage} alt="Payment QR Code" className="mx-auto rounded-xl shadow-md" style={{ maxWidth: 200, border: '1px solid var(--gray-200)' }} />
                          </div>
                        )}

                        <div className="p-4 rounded-xl" style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}>
                          <p className="text-xs font-bold mb-2" style={{ color: '#92400e' }}>💳 Payment Instructions</p>
                          <p className="text-xs leading-relaxed" style={{ color: '#78350f' }}>
                            Pay <strong>₹{selected.price}</strong> and send payment screenshot, your email ID, and e-book name to:
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-xs font-bold" style={{ color: '#92400e' }}>📧 vedhaedusparkcenter@gmail.com</p>
                            <p className="text-xs font-bold" style={{ color: '#92400e' }}>📱 9391640022</p>
                          </div>
                          <p className="text-[0.65rem] mt-2" style={{ color: '#a16207' }}>You'll receive a coupon code after verification.</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Enter Coupon Code</label>
                          <div className="flex gap-2">
                            <input value={couponCode} onChange={e => setCouponCode(e.target.value)} className="input-light !text-sm flex-1" placeholder="e.g. VES-A3B7D1" />
                            <button onClick={requestAccess} disabled={requesting || !couponCode.trim()} className="btn-primary !py-2 !px-5 !text-sm disabled:opacity-50">
                              {requesting ? '...' : 'Unlock'}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Ebooks;
