import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiPlus, HiTrash, HiPencil, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import { FaVideo, FaFilePdf, FaStickyNote, FaGripVertical } from 'react-icons/fa';
import { courseAPI, uploadAPI } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_CONTENT = { type: 'video', title: '', videoUrl: '', pdfUrl: '', contentText: '' };
const EMPTY_SECTION = { sectionTitle: '', contents: [{ ...EMPTY_CONTENT }] };

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', instructor: '', level: 'Beginner', duration: '8 weeks', image: '', sections: [] });
  const [uploading, setUploading] = useState(false);

  const load = () => { setLoading(true); courseAPI.getAll().then(({ data }) => { setCourses(data); setLoading(false); }).catch(() => setLoading(false)); };
  useEffect(load, []);

  const startCreate = () => { setEditId(null); setForm({ title: '', description: '', instructor: '', level: 'Beginner', duration: '8 weeks', image: '', sections: [] }); setShowForm(true); };
  const startEdit = (c) => { setEditId(c._id); setForm({ title: c.title, description: c.description, instructor: c.instructor || '', level: c.level, duration: c.duration || '', image: c.image || '', sections: c.sections || [] }); setShowForm(true); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { const { data } = await uploadAPI.image(file); setForm(f => ({ ...f, image: data.url })); toast.success('Image uploaded!'); }
    catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) return toast.error('Title and description required');
    try {
      if (editId) { await courseAPI.update(editId, form); toast.success('Updated!'); }
      else { await courseAPI.create(form); toast.success('Created!'); }
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete this course?')) return; try { await courseAPI.delete(id); toast.success('Deleted'); load(); } catch { toast.error('Failed'); } };

  // Section helpers
  const addSection = () => setForm(f => ({ ...f, sections: [...f.sections, { ...EMPTY_SECTION, contents: [{ ...EMPTY_CONTENT }] }] }));
  const removeSection = (si) => setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== si) }));
  const updateSection = (si, key, val) => setForm(f => { const s = [...f.sections]; s[si] = { ...s[si], [key]: val }; return { ...f, sections: s }; });
  const moveSection = (si, dir) => setForm(f => { const s = [...f.sections]; const ni = si + dir; if (ni < 0 || ni >= s.length) return f; [s[si], s[ni]] = [s[ni], s[si]]; return { ...f, sections: s }; });

  // Content helpers
  const addContent = (si) => setForm(f => { const s = [...f.sections]; s[si] = { ...s[si], contents: [...s[si].contents, { ...EMPTY_CONTENT }] }; return { ...f, sections: s }; });
  const removeContent = (si, ci) => setForm(f => { const s = [...f.sections]; s[si] = { ...s[si], contents: s[si].contents.filter((_, i) => i !== ci) }; return { ...f, sections: s }; });
  const updateContent = (si, ci, key, val) => setForm(f => { const s = [...f.sections]; const c = [...s[si].contents]; c[ci] = { ...c[ci], [key]: val }; s[si] = { ...s[si], contents: c }; return { ...f, sections: s }; });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>Manage Courses</h1>
        <button onClick={startCreate} className="btn-primary !py-2.5 !px-5 !text-sm"><HiPlus /> Add Course</button>
      </div>

      {/* ===== FORM ===== */}
      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[16px] p-6 shadow-sm space-y-5" style={{ border: '1px solid var(--gray-200)' }}>
          <h2 className="font-bold text-lg" style={{ color: 'var(--gray-900)' }}>{editId ? 'Edit' : 'Create'} Course</h2>

          {/* Step 1: Basic Info */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--gray-50)' }}>
            <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--blue-600)' }}>Step 1 — Basic Info</div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Title *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-light !text-sm" placeholder="e.g. Full Stack MERN Development" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Description *</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="input-light !text-sm resize-y" placeholder="Course description..." />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Instructor</label>
                <input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} className="input-light !text-sm" placeholder="Instructor name" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Level</label>
                <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="input-light !text-sm cursor-pointer">
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Duration</label>
                <input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="input-light !text-sm" placeholder="e.g. 3 Months" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--gray-700)' }}>Thumbnail</label>
                <div className="flex items-center gap-3">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="input-light !text-sm !py-1.5 flex-1" />
                  {form.image && <img src={form.image} className="w-12 h-12 rounded-lg object-cover" style={{ border: '1px solid var(--gray-200)' }} />}
                </div>
                {uploading && <span className="text-xs mt-1 block" style={{ color: 'var(--blue-600)' }}>Uploading...</span>}
              </div>
            </div>
          </div>

          {/* Step 2: Sections */}
          <div className="p-4 rounded-xl" style={{ background: 'var(--gray-50)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--blue-600)' }}>Step 2 — Sections ({form.sections.length})</div>
              <button onClick={addSection} className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>
                <HiPlus className="inline mr-1" />Add Section
              </button>
            </div>

            {form.sections.length === 0 && (
              <div className="text-center py-6 text-sm" style={{ color: 'var(--gray-400)' }}>No sections yet. Click "Add Section" to start building.</div>
            )}

            <div className="space-y-4">
              {form.sections.map((section, si) => (
                <div key={si} className="bg-white rounded-xl p-4 shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
                  {/* Section Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <FaGripVertical className="text-xs" style={{ color: 'var(--gray-300)' }} />
                    <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: 'var(--blue-100)', color: 'var(--blue-700)' }}>S{si + 1}</span>
                    <input value={section.sectionTitle} onChange={e => updateSection(si, 'sectionTitle', e.target.value)}
                      className="input-light !text-sm !py-1.5 flex-1" placeholder="Section title..." />
                    <button onClick={() => moveSection(si, -1)} disabled={si === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30" style={{ color: 'var(--gray-400)' }}><HiChevronUp /></button>
                    <button onClick={() => moveSection(si, 1)} disabled={si === form.sections.length - 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30" style={{ color: 'var(--gray-400)' }}><HiChevronDown /></button>
                    <button onClick={() => removeSection(si)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
                  </div>

                  {/* Contents */}
                  <div className="ml-6 space-y-3">
                    {section.contents.map((content, ci) => (
                      <div key={ci} className="p-3 rounded-lg flex flex-col gap-2" style={{ background: 'var(--gray-50)', border: '1px solid var(--gray-100)' }}>
                        <div className="flex items-center gap-2">
                          <select value={content.type} onChange={e => updateContent(si, ci, 'type', e.target.value)}
                            className="input-light !text-xs !py-1.5 !w-28 cursor-pointer">
                            <option value="video">🎥 Video</option><option value="pdf">📄 PDF</option><option value="notes">📝 Notes</option>
                          </select>
                          <input value={content.title} onChange={e => updateContent(si, ci, 'title', e.target.value)}
                            className="input-light !text-xs !py-1.5 flex-1" placeholder="Content title..." />
                          <button onClick={() => removeContent(si, ci)} className="p-1 rounded hover:bg-red-50 text-red-400 text-sm"><HiTrash /></button>
                        </div>
                        {content.type === 'video' && (
                          <input value={content.videoUrl} onChange={e => updateContent(si, ci, 'videoUrl', e.target.value)}
                            className="input-light !text-xs !py-1.5" placeholder="YouTube or video URL..." />
                        )}
                        {content.type === 'pdf' && (
                          <input value={content.pdfUrl} onChange={e => updateContent(si, ci, 'pdfUrl', e.target.value)}
                            className="input-light !text-xs !py-1.5" placeholder="PDF URL (use upload or paste link)..." />
                        )}
                        {content.type === 'notes' && (
                          <textarea value={content.contentText} onChange={e => updateContent(si, ci, 'contentText', e.target.value)}
                            rows={3} className="input-light !text-xs !py-1.5 resize-y" placeholder="Write notes content..." />
                        )}
                      </div>
                    ))}
                    <button onClick={() => addContent(si)} className="text-xs font-semibold py-1.5 px-3 rounded-lg w-full transition-colors"
                      style={{ border: '1px dashed var(--gray-300)', color: 'var(--gray-500)' }}>
                      + Add Content
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary !py-2.5 !px-6 !text-sm">{editId ? 'Update' : 'Create'} Course</button>
            <button onClick={() => setShowForm(false)} className="btn-outline !py-2.5 !px-6 !text-sm">Cancel</button>
          </div>
        </motion.div>
      )}

      {/* ===== COURSES TABLE ===== */}
      <div className="bg-white rounded-[16px] overflow-hidden shadow-sm" style={{ border: '1px solid var(--gray-200)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr style={{ borderBottom: '1px solid var(--gray-200)' }}>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Course</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Level</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Sections</th>
              <th className="text-left py-3 px-4 text-xs font-semibold uppercase" style={{ color: 'var(--gray-400)' }}>Actions</th>
            </tr></thead>
            <tbody>
              {courses.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--gray-100)' }} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      {c.image ? <img src={c.image} className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg" style={{ background: 'var(--blue-100)' }} />}
                      <div>
                        <div className="text-sm font-medium" style={{ color: 'var(--gray-800)' }}>{c.title}</div>
                        <div className="text-xs" style={{ color: 'var(--gray-400)' }}>{c.instructor}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4"><span className="badge-blue text-xs">{c.level}</span></td>
                  <td className="py-3 px-4 text-sm" style={{ color: 'var(--gray-600)' }}>{c.sections?.length || 0}</td>
                  <td className="py-3 px-4 flex gap-2">
                    <button onClick={() => startEdit(c)} className="p-2 rounded-lg hover:bg-blue-50" style={{ color: 'var(--blue-600)' }}><HiPencil /></button>
                    <button onClick={() => handleDelete(c._id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><HiTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {courses.length === 0 && <div className="text-center py-12" style={{ color: 'var(--gray-400)' }}>No courses yet.</div>}
      </div>
    </div>
  );
};

export default AdminCourses;
