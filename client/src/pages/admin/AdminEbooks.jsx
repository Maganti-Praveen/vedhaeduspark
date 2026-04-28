import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiPencil, HiX, HiMail } from 'react-icons/hi';
import { FaBook } from 'react-icons/fa';
import { ebookAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Programming', 'DSA', 'Web Development', 'Database', 'Computer Science', 'AI & ML', 'Interview Prep', 'Other'];
const ACCESS_MODES = [
  { value: 'website', label: '🌐 Website Only', desc: 'Users read/download on website' },
  { value: 'email', label: '📧 Email Only', desc: 'Admin sends PDF via email' },
  { value: 'both', label: '🔄 Both', desc: 'Website access + email delivery' },
];

const AdminEbooks = () => {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', author: 'VedhaEduSpark Team', category: 'Programming',
    image: '', pdfUrl: '', isFree: true, price: 0, qrCodeImage: '', accessMode: 'website', isActive: true,
  });

  useEffect(() => { load(); }, []);
  const load = () => { setLoading(true); ebookAPI.getAdmin().then(({ data }) => { setEbooks(data); setLoading(false); }).catch(() => setLoading(false)); };

  const resetForm = () => setForm({ title: '', description: '', author: 'VedhaEduSpark Team', category: 'Programming', image: '', pdfUrl: '', isFree: true, price: 0, qrCodeImage: '', accessMode: 'website', isActive: true });
  const startCreate = () => { setEditId(null); resetForm(); setShowForm(true); };
  const startEdit = (e) => { setEditId(e._id); setForm({ title: e.title, description: e.description, author: e.author, category: e.category, image: e.image || '', pdfUrl: e.pdfUrl, isFree: e.isFree, price: e.price || 0, qrCodeImage: e.qrCodeImage || '', accessMode: e.accessMode || 'website', isActive: e.isActive }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.title || !form.description || !form.pdfUrl) return toast.error('Title, description, and PDF are required');
    try {
      if (editId) await ebookAPI.update(editId, form);
      else await ebookAPI.create(form);
      toast.success(editId ? 'Updated!' : 'Created!');
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this e-book?')) return;
    try { await ebookAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); }
  };

  const handleSendEmail = async (ebookId) => {
    const email = prompt('Enter user email to send PDF:');
    if (!email || !email.includes('@')) return;
    try { const { data } = await ebookAPI.sendEmail(ebookId, email); toast.success(data.message); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to send'); }
  };

  const uploadPdf = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.type !== 'application/pdf') return toast.error('Only PDF files allowed');
    setUploading(true);
    try { const { data } = await uploadAPI.pdf(file); setForm(f => ({ ...f, pdfUrl: data.url })); toast.success('PDF uploaded!'); }
    catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  // ── Form View ──
  if (showForm) {
    return (
      <div className="space-y-5 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold" style={{ color: 'var(--gray-900)' }}>{editId ? 'Edit' : 'Create'} E-Book</h2>
          <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100"><HiX /></button>
        </div>
        <div className="bg-white p-5 rounded-[16px] shadow-sm space-y-4" style={{ border: '1px solid var(--gray-200)' }}>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Title *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light !text-sm" placeholder="E-Book title..." /></div>
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Author</label>
              <input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} className="input-light !text-sm" placeholder="Author name..." /></div>
          </div>
          <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-light !text-sm resize-y" placeholder="Describe the e-book..." /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-light !text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Cover Image</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={async (e) => {
                  const file = e.target.files?.[0]; if (!file) return;
                  try { const { data } = await uploadAPI.image(file); setForm(f => ({ ...f, image: data.url })); toast.success('Uploaded!'); }
                  catch { toast.error('Upload failed'); }
                }} className="input-light !text-sm !py-1.5 flex-1" />
                {form.image && <img src={form.image} className="w-12 h-12 rounded-lg object-cover" />}
              </div></div>
          </div>

          {/* PDF Upload */}
          <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>PDF File *</label>
            <div className="flex items-center gap-3">
              <input type="file" accept=".pdf" onChange={uploadPdf} className="input-light !text-sm !py-1.5 flex-1" />
              {uploading && <span className="text-xs" style={{ color: 'var(--blue-600)' }}>Uploading...</span>}
              {form.pdfUrl && <a href={form.pdfUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold" style={{ color: '#16a34a' }}>✅ PDF Ready</a>}
            </div></div>

          {/* Pricing */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer mb-2">
                <input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked, price: e.target.checked ? 0 : form.price })} className="accent-blue-600" />
                <span className="text-sm font-semibold" style={{ color: 'var(--gray-700)' }}>Free E-Book</span>
              </label>
              {!form.isFree && (
                <>
                  <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Price (₹)</label>
                    <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="input-light !text-sm" min="0" /></div>
                  <div><label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Payment QR Code <span className="text-[0.6rem] font-normal" style={{ color: 'var(--gray-400)' }}>(shown to users for payment)</span></label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0]; if (!file) return;
                          try { const { data } = await uploadAPI.image(file); setForm(f => ({ ...f, qrCodeImage: data.url })); toast.success('QR uploaded!'); }
                          catch { toast.error('Upload failed'); }
                        }} className="input-light !text-sm !py-1.5 flex-1" />
                      </div>
                      <input value={form.qrCodeImage} onChange={e => setForm({ ...form, qrCodeImage: e.target.value })} className="input-light !text-sm" placeholder="Or paste QR code image URL..." />
                      {form.qrCodeImage && (
                        <div className="flex items-center gap-3 p-2 rounded-lg" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-200)' }}>
                          <img src={form.qrCodeImage} className="w-20 h-20 rounded-lg object-contain" />
                          <div className="flex-1">
                            <p className="text-xs font-semibold" style={{ color: '#16a34a' }}>✅ QR Code ready</p>
                            <p className="text-[0.6rem]" style={{ color: 'var(--gray-400)' }}>This will be shown to users when they try to buy this e-book.</p>
                          </div>
                          <button type="button" onClick={() => setForm(f => ({ ...f, qrCodeImage: '' }))} className="text-xs px-2 py-1 rounded hover:bg-red-50" style={{ color: '#ef4444' }}>Remove</button>
                        </div>
                      )}
                    </div></div>
                </>
              )}
            </div>
            <div><label className="block text-xs font-semibold mb-2" style={{ color: 'var(--gray-700)' }}>Access Mode</label>
              <div className="space-y-2">
                {ACCESS_MODES.map(m => (
                  <label key={m.value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="accessMode" value={m.value} checked={form.accessMode === m.value} onChange={() => setForm({ ...form, accessMode: m.value })} className="accent-blue-600" />
                    <div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--gray-700)' }}>{m.label}</span>
                      <span className="text-[0.6rem] ml-1" style={{ color: 'var(--gray-400)' }}>— {m.desc}</span>
                    </div>
                  </label>
                ))}
              </div></div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} className="accent-blue-600" />
            <span className="text-sm font-semibold" style={{ color: 'var(--gray-700)' }}>Active (visible to users)</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="btn-primary !py-2.5 !px-8">{editId ? 'Update' : 'Create'} E-Book</button>
          <button onClick={() => setShowForm(false)} className="btn-outline !py-2.5 !px-6">Cancel</button>
        </div>
      </div>
    );
  }

  // ── List View ──
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>📚 E-Book Management</h1>
          <p className="text-sm" style={{ color: 'var(--gray-500)' }}>Create and manage e-books with PDF delivery</p>
        </div>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5"><HiPlus /> Add E-Book</button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}</div>
      ) : ebooks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-[20px] shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
          <FaBook className="text-5xl mx-auto mb-3" style={{ color: 'var(--gray-300)' }} />
          <p className="font-medium" style={{ color: 'var(--gray-500)' }}>No e-books yet. Create one!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {ebooks.map((e, i) => (
            <motion.div key={e._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              className="bg-white p-4 rounded-[16px] shadow-sm flex items-center justify-between gap-4" style={{ border: '1px solid var(--gray-200)' }}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {e.image ? <img src={e.image} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" /> :
                  <div className="w-14 h-14 rounded-lg flex items-center justify-center text-2xl flex-shrink-0" style={{ background: '#ede9fe' }}>📚</div>}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <h3 className="font-bold text-sm truncate" style={{ color: 'var(--gray-900)' }}>{e.title}</h3>
                    <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#dbeafe', color: '#2563eb' }}>{e.category}</span>
                    <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{
                      background: e.isFree ? '#dcfce7' : '#fef3c7', color: e.isFree ? '#16a34a' : '#d97706'
                    }}>{e.isFree ? 'Free' : `₹${e.price}`}</span>
                    <span className="text-[0.6rem] font-bold px-2 py-0.5 rounded-full" style={{ background: '#f3e8ff', color: '#7c3aed' }}>
                      {e.accessMode === 'website' ? '🌐 Website' : e.accessMode === 'email' ? '📧 Email' : '🔄 Both'}
                    </span>
                  </div>
                  <p className="text-xs truncate" style={{ color: 'var(--gray-400)' }}>
                    by {e.author} • {e.downloadCount || 0} downloads • {e.accessGranted?.length || 0} users
                  </p>
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {(e.accessMode === 'email' || e.accessMode === 'both') && (
                  <button onClick={() => handleSendEmail(e._id)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }} title="Send PDF via email"><HiMail /></button>
                )}
                <button onClick={() => startEdit(e)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }} title="Edit"><HiPencil /></button>
                <button onClick={() => handleDelete(e._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><HiTrash /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminEbooks;
